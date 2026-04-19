# Page Inventory Report

Generated: 2026-04-19  
Source: `data/raw_scraped_pages/` — 177 JSON files scanned (page_001–page_177 + footer.json)  
Sitemap reference: `docs/url_classification.json`

---

> ⚠️ **URL 规范化警告（影响全部匹配结果）**
>
> raw 文件中的 `page_url` 值**普遍缺少末尾斜杠**（如
> `.../capstone-project-archive` 而非 `.../capstone-project-archive/`），
> 而 `url_classification.json` 的所有 URL 均以 `/` 结尾。
> 清洗脚本和检索代码在做 URL 对照前，必须统一做 `url.rstrip('/') + '/'`
> 规范化，否则 exact-match 会大量误判为 unlisted。
>
> 本报告中凡涉及"缺失"或"unlisted"的判断，均已在人工核查时注明此问题。

---

## 1. 在 sitemap 中的页面（按 priority 分组）

### must（9 个）— 全部在 raw 中找到

| URL |
|-----|
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/ |
| https://datascience.uchicago.edu/education/masters-programs/in-person-program/ |
| https://datascience.uchicago.edu/education/masters-programs/online-program/ |
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/course-progressions/ |
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/faqs/ |
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/how-to-apply/ |
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/instructors-staff/ |
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/capstone-projects/ |
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/events-deadlines/ |

### should — 精确 URL 匹配（5 个）

| URL | 状态 |
|-----|------|
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/career-outcomes/ | ✓ 已爬取 |
| https://datascience.uchicago.edu/education/tuition-fees-aid/ | ✓ 已爬取 |
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/our-students/ | ✓ 已爬取 |
| https://datascience.uchicago.edu/explore-the-ms-ads-campus/ | ✓ 已爬取 |
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/capstone-project-archive/ | ⚠️ raw 中存在但**末尾无斜杠**（`/capstone-project-archive` 而非 `/capstone-project-archive/`）——规范化后视为已爬取 |

### should — pattern 匹配 `/people/{slug}/`（0 个）

**raw 中未发现任何独立的 `/people/` 人物 profile 页面。**  
sitemap 标记约 50+ 个 faculty/staff 页面为 `priority: should`，但爬虫完全未覆盖此路径。  
→ 见 §3 漏爬清单。

### optional — 精确 URL（10 个 D3 capstone projects）

> 注：以下 URL 在 raw 中以**无末尾斜杠**形式存在，规范化后视为已爬取。

| URL |
|-----|
| https://datascience.uchicago.edu/research/argonne-rezzy-ai-support-chatbot-for-ev-charger-reservation-app-evrez/ |
| https://datascience.uchicago.edu/research/inference-analytics-automated-icd-10-code-prediction-for-healthcare-reports-using-large-language-models/ |
| https://datascience.uchicago.edu/research/research-gpt-for-healthcare-mcp-driven-multi-agent-rag-enhanced-llm-system-for-prostate-cancer-temporal-summarization/ |
| https://datascience.uchicago.edu/research/global-iq-optimizing-roi-of-global-talent-mobility-through-predictive-modeling-and-optimization-for-corporate-programs-policies/ |
| https://datascience.uchicago.edu/research/research-gpt-for-healthcare-applications-of-generative-ai-in-emergency-department-admission-evaluation/ |
| https://datascience.uchicago.edu/research/chicago-white-sox-measuring-pitcher-deception-and-command-using-motion-tracking-data/ |
| https://datascience.uchicago.edu/research/aetna-optimization-engine-creation-scenario-planning-and-sensitivity-analysis-tool/ |
| https://datascience.uchicago.edu/research/latentview-analytics-visual-defect-detection/ |
| https://datascience.uchicago.edu/research/here-technologies-vehicle-perception-data-vpd-and-here-lane-model-alignment/ |
| https://datascience.uchicago.edu/research/ateema-ai-driven-media-kit/ |

### optional — pattern 匹配 `/research/{slug}/`（47+ 个）

raw 中存在大量非 sitemap 列出的 `/research/[slug]` 页面，命中 url_patterns 中 `optional` 规则。  
见 §2 中标注 `[optional via pattern]` 的条目。

### skip — 精确 URL（在 raw 中出现，确认为范围外）

| URL |
|-----|
| https://datascience.uchicago.edu/research/ |
| https://datascience.uchicago.edu/about/leadership-staff/ |
| https://datascience.uchicago.edu/fellows-and-scholars/ |
| https://www.uchicago.edu/en/education-and-research/academic-calendar |

### alias（在 raw 中出现）

| alias URL | canonical URL |
|-----------|--------------|
| https://datascience.uchicago.edu/how-to-apply/ | .../ms-in-applied-data-science/how-to-apply/ |
| https://datascience.uchicago.edu/about-us/ | .../ms-in-applied-data-science/instructors-staff/ |
| https://datascience.uchicago.edu/capstone-projects/ | .../ms-in-applied-data-science/capstone-projects/ |
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/in-person-program/ | .../masters-programs/in-person-program/ |
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/online-program/ | .../masters-programs/online-program/ |

---

## 2. 不在 sitemap 中的页面（unlisted，共 ~100 个）

> 待决策：每条请标注 `skip` 或补进 sitemap。
> 标有 `[optional via pattern]` 的条目已被 url_patterns 中 `/research/{slug}/` 规则命中，可直接纳入。

### DSI 站点导航 / Hub 页（建议 skip）

- https://datascience.uchicago.edu（首页，无路径）
- https://datascience.uchicago.edu/education/masters-programs
- https://datascience.uchicago.edu/education
- https://datascience.uchicago.edu/about
- https://datascience.uchicago.edu/about/about-dsi
- https://datascience.uchicago.edu/about/jobs
- https://datascience.uchicago.edu/about/contact
- https://datascience.uchicago.edu/about/research-advisory-committee
- https://datascience.uchicago.edu/about/visiting-dsi
- https://datascience.uchicago.edu/about/leadership-staff（注：已在 entries skip 中，raw 命中别名）
- https://datascience.uchicago.edu/nondiscrimination-statement
- https://datascience.uchicago.edu/newsletter-archive
- https://datascience.uchicago.edu/ai-science-research-funding-opportunities-fall-2025
- https://datascience.uchicago.edu/the-university-of-chicago-and-caltech-conference-on-ai-science

### Education 子页面（建议 skip，非 MS-ADS 专属）

- https://datascience.uchicago.edu/education/undergrad-major
- https://datascience.uchicago.edu/education/phd-in-data-science
- https://datascience.uchicago.edu/education/data-science-clinic
- https://datascience.uchicago.edu/education/summer-research-programs
- https://datascience.uchicago.edu/education/summerlab
- https://datascience.uchicago.edu/education/summerlab/program-details
- https://datascience.uchicago.edu/education/summerlab/mentors
- https://datascience.uchicago.edu/education/summerlab/faq
- https://datascience.uchicago.edu/education/summerlab/alumni-and-projects
- https://datascience.uchicago.edu/education/summerlab/2024-project-profiles
- https://datascience.uchicago.edu/education/summerlab/2021-cohort
- https://datascience.uchicago.edu/education/summerlab/2020-cohort
- https://datascience.uchicago.edu/education/summerlab/2019-cohort
- https://datascience.uchicago.edu/education/internships/application
- https://datascience.uchicago.edu/education/internships/project-profiles/2023-project-profiles
- https://datascience.uchicago.edu/education/internships/project-profiles/2022-project-profiles
- https://datascience.uchicago.edu/education/data4all/undergrad-mentor

### Outreach 子页面（建议 skip）

- https://datascience.uchicago.edu/outreach
- https://datascience.uchicago.edu/outreach/11th-hour-project
- https://datascience.uchicago.edu/outreach/data4all
- https://datascience.uchicago.edu/outreach/data4all/apply
- https://datascience.uchicago.edu/outreach/data4all/educational-materials
- https://datascience.uchicago.edu/outreach/community-data-fellows
- https://datascience.uchicago.edu/outreach/community-data-fellows/program-details
- https://datascience.uchicago.edu/outreach/community-data-fellows/program-details/students
- https://datascience.uchicago.edu/outreach/community-data-fellows/program-details/partners
- https://datascience.uchicago.edu/outreach/community-data-fellows/resources
- https://datascience.uchicago.edu/outreach/preceptors
- https://datascience.uchicago.edu/outreach/industry-partnerships
- https://datascience.uchicago.edu/outreach/industry-partnerships/industry-affiliate-program
- https://datascience.uchicago.edu/outreach/industry-partnerships/industry-affiliate-program/professional-education
- https://datascience.uchicago.edu/outreach/industry-partnerships/industry-affiliate-program/membership-opportunities
- https://datascience.uchicago.edu/outreach/industry-partnerships/industry-affiliate-program/data-science-clinic
- https://datascience.uchicago.edu/outreach/industry-partnerships/industry-partners
- https://datascience.uchicago.edu/outreach/industry-partnerships/philanthropic-giving
- https://datascience.uchicago.edu/outreach/industry-partnerships/dsi-leadership-rooted-in-industry
- https://datascience.uchicago.edu/outreach/industry-partnerships/chicago-data-night
- https://datascience.uchicago.edu/outreach/industry-partnerships/contact-us
- https://datascience.uchicago.edu/outreach/data-science-for-social-impact-network
- https://datascience.uchicago.edu/outreach/data-science-for-social-impact-network/summer-experience
- https://datascience.uchicago.edu/outreach/data-science-for-social-impact-network/summer-experience/2023
- https://datascience.uchicago.edu/outreach/data-science-for-social-impact-network/summer-experience/2024
- https://datascience.uchicago.edu/outreach/data-science-for-social-impact-network/summer-experience/2025
- https://datascience.uchicago.edu/outreach/capacity-accelerator-network/capacity-accelerator-network

### Research Hub 子页面（建议 skip，非 MS-ADS 专属）

- https://datascience.uchicago.edu/research/projects
- https://datascience.uchicago.edu/research/research-funding
- https://datascience.uchicago.edu/research/research-funding/ai-science-research-funding-opportunities
- https://datascience.uchicago.edu/research/research-funding/dsi-research-initiative-request-for-proposals
- https://datascience.uchicago.edu/research/data-democracy
- https://datascience.uchicago.edu/research/data-democracy/events
- https://datascience.uchicago.edu/research/ai-science
- https://datascience.uchicago.edu/research/ai-science/about-the-ai-and-science-initiative
- https://datascience.uchicago.edu/research/ai-science/partnerships
- https://datascience.uchicago.edu/research/ai-science/partnerships/nitmb
- https://datascience.uchicago.edu/research/ai-science/partnerships/schmidt-faculty-fellows
- https://datascience.uchicago.edu/research/ai-science/partnerships/schmidt-fellows
- https://datascience.uchicago.edu/research/ai-science/partnerships/summer-school
- https://datascience.uchicago.edu/research/ai-science/partnerships/pritzker-aiscience-joint-initiative-with-caltech
- https://datascience.uchicago.edu/research/ai-science/partnerships/center-for-living-systems
- https://datascience.uchicago.edu/research/ai-science/partnerships/skai
- https://datascience.uchicago.edu/research/ai-science/partnerships/pritzker-prize
- https://datascience.uchicago.edu/research/ai-science/people
- https://datascience.uchicago.edu/research/ai-science/projects
- https://datascience.uchicago.edu/research/ai-science/events
- https://datascience.uchicago.edu/research/ai-science/news
- https://datascience.uchicago.edu/research/ai-science/opportunities
- https://datascience.uchicago.edu/research/ai-science-2/partnerships/skai
- https://datascience.uchicago.edu/research/aice-ai-for-climate
- https://datascience.uchicago.edu/research/novel-intelligence
- https://datascience.uchicago.edu/research/data-ecology
- https://datascience.uchicago.edu/research/data-ecology/insights
- https://datascience.uchicago.edu/research/internet-innovation
- https://datascience.uchicago.edu/research/open-spatial-lab
- https://datascience.uchicago.edu/research/data-science-software-development-core
- https://datascience.uchicago.edu/research/outlier-research-evaluation
- https://datascience.uchicago.edu/research/postdoctoral-programs
- https://datascience.uchicago.edu/research/postdoctoral-programs/rising-stars
- https://datascience.uchicago.edu/research/postdoctoral-programs/dsi-scholars
- https://datascience.uchicago.edu/research/postdoctoral-programs/the-eric-and-wendy-schmidt-ai-in-science-postdoctoral-fellowship
- https://datascience.uchicago.edu/research/postdoctoral-programs/rising-stars-in-data-science-2/2025-rising-stars
- https://datascience.uchicago.edu/research/postdoctoral-programs/rising-stars-in-data-science-2/2024-rising-stars
- https://datascience.uchicago.edu/research/postdoctoral-programs/rising-stars-in-data-science-2/2023-rising-stars
- https://datascience.uchicago.edu/research/postdoctoral-programs/rising-stars/2022
- https://datascience.uchicago.edu/research/postdoctoral-programs/rising-stars/2021

### News / Events / Insights（命中 url_patterns skip，建议维持 skip）

- https://datascience.uchicago.edu/news-events/news
- https://datascience.uchicago.edu/news-events/events
- https://datascience.uchicago.edu/insights

### 其他 unlisted（待决）

- https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/capstone-project-archive（同上，无尾斜杠版本，规范化后已命中 should）

---

## 3. sitemap must/should 但 raw 中缺失的页面（漏爬清单）

### 精确 URL 漏爬：0 条

所有 must/should 精确 URL 均已爬取（capstone-project-archive 以无尾斜杠形式存在，规范化后视为已覆盖）。

### Pattern 漏爬（/people/{slug}/）— 约 50 个，全部缺失 ⚠️ CRITICAL

sitemap 将 `/people/{slug}/` 整体标记为 `priority: should`，共约 50 个 faculty/staff 页面。  
**raw 中完全没有任何 `/people/` 路径的 JSON 文件。**

以下为 sitemap §2 明确列出的全部 people URL（均未爬取）：

| URL |
|-----|
| https://datascience.uchicago.edu/people/greg-green/ |
| https://datascience.uchicago.edu/people/arnab-bose-phd/ |
| https://datascience.uchicago.edu/people/patrick-vonesh/ |
| https://datascience.uchicago.edu/people/jose-alvarado/ |
| https://datascience.uchicago.edu/people/matthew-harris-ridker/ |
| https://datascience.uchicago.edu/people/francisco-azeredo-phd/ |
| https://datascience.uchicago.edu/people/anil-d-chaturvedi-phd/ |
| https://datascience.uchicago.edu/people/nick-kadochnikov/ |
| https://datascience.uchicago.edu/people/ming-long-lam-phd/ |
| https://datascience.uchicago.edu/people/roger-moore-mba/ |
| https://datascience.uchicago.edu/people/utku-pamuksuz-phd/ |
| https://datascience.uchicago.edu/people/donald-patchell-mse-mba/ |
| https://datascience.uchicago.edu/people/jonathan-williams-ms/ |
| https://datascience.uchicago.edu/people/shaddy-abado-phd-2/ |
| https://datascience.uchicago.edu/people/gizem-agar-phd/ |
| https://datascience.uchicago.edu/people/mike-anderson/ |
| https://datascience.uchicago.edu/people/stephen-barry/ |
| https://datascience.uchicago.edu/people/shree-bharadwaj-ms/ |
| https://datascience.uchicago.edu/people/sanjay-boddhu-phd/ |
| https://datascience.uchicago.edu/people/fouad-bousetouane-phd/ |
| https://datascience.uchicago.edu/people/shahbaz-chaudhary-ma/ |
| https://datascience.uchicago.edu/people/sebastien-donadio-phd/ |
| https://datascience.uchicago.edu/people/ignas-grabauskas/ |
| https://datascience.uchicago.edu/people/batu-gundogdu-phd/ |
| https://datascience.uchicago.edu/people/justin-kurland-phd/ |
| https://datascience.uchicago.edu/people/jeong-yoon-lee-phd/ |
| https://datascience.uchicago.edu/people/john-navarro/ |
| https://datascience.uchicago.edu/people/danny-ng-phd/ |
| https://datascience.uchicago.edu/people/ashish-pujari/ |
| https://datascience.uchicago.edu/people/jenny-schmidt/ |
| https://datascience.uchicago.edu/people/jeanette-shutay-phd/ |
| https://datascience.uchicago.edu/people/fan-yang-phd/ |
| https://datascience.uchicago.edu/people/dmitri-sidorov/ |
| https://datascience.uchicago.edu/people/igor-yakushin-phd/ |
| https://datascience.uchicago.edu/people/taylor-alexander/ |
| https://datascience.uchicago.edu/people/briana-allen/ |
| https://datascience.uchicago.edu/people/josie-badillo-sittig/ |
| https://datascience.uchicago.edu/people/zach-brown/ |
| https://datascience.uchicago.edu/people/kendall-cox/ |
| https://datascience.uchicago.edu/people/nick-diantonio-m-ed/ |
| https://datascience.uchicago.edu/people/lauren-isaacman-darga/ |
| https://datascience.uchicago.edu/people/henry-igunbor/ |
| https://datascience.uchicago.edu/people/emma-kerr/ |
| https://datascience.uchicago.edu/people/samantha-kruse/ |
| https://datascience.uchicago.edu/people/lauren-milewski-msed/ |
| https://datascience.uchicago.edu/people/alison-ossyra/ |
| https://datascience.uchicago.edu/people/dujuan-smith/ |
| https://datascience.uchicago.edu/people/daniel-truesdale/ |
| https://datascience.uchicago.edu/people/taylor-wallace/ |
| https://datascience.uchicago.edu/people/jennifer-wei-mem/ |
| https://datascience.uchicago.edu/people/samantha-widemon/ |
| https://datascience.uchicago.edu/people/ben-wiebers/ |

**建议：** 补爬以上全部 /people/ URL，使用 Playwright 或 requests，爬后按 `redact_pii` 标签处理。

---

## 4. 统计汇总

| 分类 | 条目数（sitemap） | 在 raw 中找到 | 缺失 |
|------|-----------------|--------------|------|
| must | 9 | 9 | 0 |
| should（精确 URL） | 5 | 5 ⚠️ | 0（含 1 条需规范化尾斜杠） |
| should（/people/ pattern） | ~52 | **0** | **~52** |
| optional（精确 D3） | 10 | 10 ⚠️ | 0（含尾斜杠规范化问题） |
| optional（/research/ pattern） | — | 47+ | — |
| skip（精确） | 4 | 4 | — |
| alias | 5 | 5 | — |
| **unlisted（raw 中出现但不在 sitemap）** | — | **~100** | — |
| **raw 总文件数** | — | **177** | — |

---

## 5. 行动建议

| 优先级 | 行动 |
|--------|------|
| 🔴 Critical | 补爬全部 52 个 `/people/[name]/` 页面（sitemap priority: should，当前 0 条） |
| 🟡 High | 清洗脚本在 URL 对照前统一规范化末尾斜杠（`url.rstrip('/') + '/'`） |
| 🟡 High | 确认 footer.json 的处理方式：其 `source_url` 字段值为首页 URL，非标准 page_url，建议在清洗时跳过 |
| 🟢 Medium | 对 §2 unlisted 列表逐条决策 skip 或补进 sitemap（大量 outreach/research hub 页可直接 skip） |
| 🟢 Low | 对 47+ 命中 `/research/{slug}/` pattern 的非 sitemap 研究页面决策是否纳入 optional |
