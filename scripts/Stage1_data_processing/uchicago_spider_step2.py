import json
import re
import os
import time
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse, urlunparse, parse_qsl, urlencode, unquote
import requests
from bs4 import BeautifulSoup, NavigableString, Tag

# =========================
# 全局配置
# =========================
SITEMAP_FILE = "sitemap.json"
OUTPUT_DIR = "scraped_pages"
CRAWL_DELAY = 0.5
KEEP_SECTION_HTML = True

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
DROP_SCHEMES = {"mailto", "tel", "javascript"}
TRACKING_PARAMS_PREFIX = ("utm_",)
TRACKING_PARAMS_EXACT = {"fbclid", "gclid"}

def normalize_url(url: str) -> str | None:
    if not url: return None
    url = unquote(url).strip()
    if not url: return None
    parsed = urlparse(url)
    if parsed.scheme.lower() in DROP_SCHEMES: return None
    if not parsed.netloc: return None

    scheme = parsed.scheme.lower()
    netloc = parsed.netloc.lower()
    path = parsed.path.strip().replace(" ", "")

    query_pairs = []
    for k, v in parse_qsl(parsed.query, keep_blank_values=True):
        if k in TRACKING_PARAMS_EXACT: continue
        if any(k.startswith(prefix) for prefix in TRACKING_PARAMS_PREFIX): continue
        query_pairs.append((k, v))
        
    query_pairs.sort()
    query = urlencode(query_pairs, doseq=True)

    if path == "/":
        path = ""
    elif path.endswith("/"):
        path = path[:-1]

    return urlunparse((scheme, netloc, path, "", query, ""))

def clean_text(text: str) -> str:
    if text is None: return ""
    text = text.replace("\xa0", " ")
    return re.sub(r"\s+", " ", text).strip()

def node_to_markdown(node, base_url: str) -> str:
    if isinstance(node, NavigableString): return str(node)
    if not isinstance(node, Tag): return ""
    if node.name in {"script", "style", "noscript"}: return ""
    if node.name == "br": return "\n"

    if node.name == "a":
        href = normalize_url(urljoin(base_url, node.get("href", "").strip())) if node.get("href") else None
        text = clean_text(node.get_text(" ", strip=True))
        if href and text: return f"[{text}]({href})"
        if href and not text: return href
        return text

    parts = [node_to_markdown(child, base_url) for child in node.children]
    joined = "".join(parts)
    if node.name in {"p", "div", "section", "article", "li", "h1", "h2", "h3", "h4", "h5", "h6"}:
        return joined.strip() + "\n"
    return joined

def extract_breadcrumbs(soup: BeautifulSoup, url: str) -> list:
    breadcrumbs = []
    nav_node = soup.find(lambda tag: tag.has_attr('aria-label') and 'breadcrumb' in tag['aria-label'].lower())
    if not nav_node:
        nav_node = soup.find(attrs={"class": re.compile(r"breadcrumb", re.I)})
        
    if nav_node:
        for item in nav_node.find_all(['a', 'span', 'li']):
            text = clean_text(item.get_text(" ", strip=True))
            if text and text not in {'>', '/', '»', '|'}:
                href = normalize_url(urljoin(url, item.get("href", ""))) if item.name == 'a' else ""
                if not any(b.get("text") == text for b in breadcrumbs):
                    breadcrumbs.append({"text": text, "href": href})
                    
    if not breadcrumbs:
        parsed = urlparse(url)
        path_parts = [p for p in parsed.path.split('/') if p]
        current_build_url = f"{parsed.scheme}://{parsed.netloc}"
        breadcrumbs.append({"text": "Home", "href": current_build_url})
        for part in path_parts:
            current_build_url = f"{current_build_url}/{part}"
            breadcrumbs.append({"text": part.replace("-", " ").title(), "href": current_build_url})
            
    return breadcrumbs

def scrape_single_page(url: str) -> dict:
    resp = requests.get(url, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    page_title = soup.title.get_text(strip=True) if soup.title else ""
    meta_desc_tag = soup.find("meta", attrs={"name": "description"})
    meta_desc = meta_desc_tag.get("content", "").strip() if meta_desc_tag else ""
    
    breadcrumbs = extract_breadcrumbs(soup, url)

    main = soup.select_one("main#main") or soup.select_one("main") or soup.body
    if not main: return {}

    for bad in main.select("script, style, noscript"):
        bad.decompose()

    all_text_markdown = ""
    parts = []
    for tag in main.find_all(["h1", "h2", "h3", "h4", "h5", "h6", "p", "li"], recursive=True):
        md = clean_text(node_to_markdown(tag, url))
        if md: parts.append(md)
    all_text_markdown = "\n".join(parts).strip()

    sections = []
    section_nodes = main.select("section") or main.select("article, aside, div.content-block")
    
    for idx, sec in enumerate(section_nodes):
        sec_plain_text = clean_text(sec.get_text(" ", strip=True))
        if len(sec_plain_text) < 20: continue

        content = []
        for tag in sec.find_all(["h1", "h2", "h3", "h4", "h5", "h6", "p", "li"], recursive=True):
            md_text = clean_text(node_to_markdown(tag, url))
            if not md_text: continue
            if tag.name.startswith("h"):
                content.append({"type": "heading", "level": int(tag.name[1]), "text": md_text})
            elif tag.name == "p":
                content.append({"type": "paragraph", "text": md_text})
            elif tag.name == "li":
                content.append({"type": "list_item", "text": md_text})
                
        text_markdown = "\n".join([f"{'#'*c['level']} {c['text']}" if c['type']=='heading' else (f"- {c['text']}" if c['type']=='list_item' else c['text']) for c in content]).strip()

        sections.append({
            "section_index": idx,
            "content": content,
            "text_markdown": text_markdown
        })

    return {
        "page_url": url,
        "page_title": page_title,
        "meta_description": meta_desc,
        "breadcrumbs": breadcrumbs,
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "all_text_markdown": all_text_markdown,
        "sections": sections
    }

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    if not os.path.exists(SITEMAP_FILE):
        print(f"错误: 找不到 {SITEMAP_FILE}。请先运行 uchicago_spider_step1.py 生成网站拓扑。")
        return

    with open(SITEMAP_FILE, "r", encoding="utf-8") as f:
        sitemap_urls = json.load(f)

    print(f"\n--- [第二步] 开始深度内容提取 (共 {len(sitemap_urls)} 个页面) ---")
    
    for i, url in enumerate(sitemap_urls):
        file_name = f"page_{i+1:03d}.json"
        file_path = os.path.join(OUTPUT_DIR, file_name)
        
        if os.path.exists(file_path):
            print(f"[{i+1}/{len(sitemap_urls)}] 跳过已爬取页面: {url}")
            continue
            
        print(f"[{i+1}/{len(sitemap_urls)}] 正在解析: {url}")
        try:
            page_data = scrape_single_page(url)
            if page_data:
                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump(page_data, f, ensure_ascii=False, indent=2)
            time.sleep(CRAWL_DELAY)
        except Exception as e:
            print(f"  -> 解析失败: {e}")

    print("\n--- 全部任务完成！数据已保存在 scraped_pages/ 目录下 ---")

if __name__ == "__main__":
    main()
