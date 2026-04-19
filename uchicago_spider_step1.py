import json
import time
from collections import deque
from urllib.parse import urljoin, urlparse, urlunparse, parse_qsl, urlencode, unquote
import requests
from bs4 import BeautifulSoup

# =========================
# 全局配置
# =========================
START_URL = "https://datascience.uchicago.edu/"
ALLOWED_DOMAIN = "datascience.uchicago.edu"
SITEMAP_FILE = "sitemap.json"
MAX_PAGES_TO_CRAWL = 999
CRAWL_DELAY = 0.5

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
        
    # 【去重升级 1】排序查询参数，保证 ?a=1&b=2 和 ?b=2&a=1 被识别为同一个 URL
    query_pairs.sort()
    query = urlencode(query_pairs, doseq=True)

    # 【去重升级 2】统一根路径处理：把 "/" 和 "" 都当成空字符串，防止主页重复
    if path == "/":
        path = ""
    elif path.endswith("/"):
        path = path[:-1]

    return urlunparse((scheme, netloc, path, "", query, ""))

def is_internal_link(url: str) -> bool:
    parsed = urlparse(url)
    if parsed.netloc.lower() != ALLOWED_DOMAIN:
        return False
        
    # 增加规则：排除特定目录下的页面 (仅排除下属子页面，保留主页本身)
    excluded_prefixes = (
        "/people/",
        "/news-events/news/",
        "/insights/",
        "/news-events/events/",
        "/events/",
	"/news/"
    )
    if parsed.path.startswith(excluded_prefixes):
        return False
        
    return True

def get_all_links_from_html(url: str, html: str) -> list:
    soup = BeautifulSoup(html, "html.parser")
    links = set()
    for a in soup.find_all("a", href=True):
        href_raw = a.get("href", "").strip()
        href_abs = urljoin(url, href_raw)
        href_norm = normalize_url(href_abs)
        if href_norm and is_internal_link(href_norm):
            links.add(href_norm)
    return list(links)

def build_sitemap(start_url: str, max_pages: int):
    start_url = normalize_url(start_url) or start_url
    print(f"\n--- [第一步] 开始构建网站拓扑结构 (起点: {start_url}) ---")
    queue = deque([start_url])
    visited = set([start_url])
    sitemap = []

    while queue and len(sitemap) < max_pages:
        current_url = queue.popleft()
        print(f"[{len(sitemap) + 1}/{max_pages}] 正在发现: {current_url}")
        
        try:
            resp = requests.get(current_url, headers=HEADERS, timeout=15)
            resp.raise_for_status()
            
            # 【去重升级 3】穿透网站的重定向，获取服务器最终返回的真实 URL
            final_url = normalize_url(resp.url)
            if not final_url or not is_internal_link(final_url):
                continue
                
            if "text/html" not in resp.headers.get("Content-Type", ""):
                continue
                
            # 如果访问后被重定向到了一个已经爬过的页面，就放弃
            if final_url != current_url:
                if final_url in visited:
                    print(f"  -> 重定向至已访问页面，跳过: {final_url}")
                    continue
                visited.add(final_url)
                
            html = resp.text
            # 将最真实的 final_url 加入站点地图
            sitemap.append(final_url)
            
            internal_links = get_all_links_from_html(final_url, html)
            for link in internal_links:
                if link not in visited:
                    visited.add(link)
                    queue.append(link)
                    
            time.sleep(CRAWL_DELAY)
            
        except Exception as e:
            print(f"  -> 请求失败 {current_url}: {e}")

    with open(SITEMAP_FILE, "w", encoding="utf-8") as f:
        json.dump(sitemap, f, indent=2)
    print(f"--- [第一步] 完成！共发现 {len(sitemap)} 个页面。拓扑已保存至 {SITEMAP_FILE} ---\n")

if __name__ == "__main__":
    build_sitemap(START_URL, MAX_PAGES_TO_CRAWL)
