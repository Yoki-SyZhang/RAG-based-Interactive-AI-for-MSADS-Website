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

### must（14 个）— 全部在 raw 中找到

| URL | 状态 |
|-----|------|
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/ | ✓ 已爬取 |
| https://datascience.uchicago.edu/education/masters-programs/in-person-program/ | ✓ 已爬取 |
| https://datascience.uchicago.edu/education/masters-programs/online-program/ | ✓ 已爬取 |
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/course-progressions/ | ✓ 已爬取 |
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/faqs/ | ✓ 已爬取 |
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/how-to-apply/ | ✓ 已爬取 |
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/instructors-staff/ | ✓ 已爬取 |
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/capstone-projects/ | ✓ 已爬取 |
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/events-deadlines/ | ✓ 已爬取 |
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/career-outcomes/ | ✓ 已爬取 |
| https://datascience.uchicago.edu/education/tuition-fees-aid/ | ✓ 已爬取 |
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/our-students/ | ✓ 已爬取 |
| https://datascience.uchicago.edu/explore-the-ms-ads-campus/ | ✓ 已爬取 |
| https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/capstone-project-archive/ | ⚠️ raw 中存在但**末尾无斜杠**——规范化后视为已爬取 |

### optional — pattern 匹配 `/people/{slug}/`（0 个，不做爬取）

**人工Review结果：** /people/ URL 的信息可以在 /instructors-staff/ 的 Accordion 里看到（包含完整传记段落），且用户一般无法直接点击到 /people/ URL，所以不做进一步爬取。  
→ 原 §3 漏爬清单仅供存档，无需补爬行动。

### optional — 精确 URL（39 个 MS-ADS capstone project 对应的 /research/ 页面）

> 这 39 条 URL 均为 MS-ADS 学生 Capstone 项目页面，来源于 `/capstone-project-archive/` 全部 4 个分页（JS 渲染，2026-04-19 手动抓取）。可 optional 保留以支持项目话题查询。  
> 注：raw 中以**无末尾斜杠**形式存在的 URL，规范化后视为已爬取（前 10 条）；后 29 条尚未爬取。

| # | URL | raw 状态 |
|---|-----|---------|
| 1 | https://datascience.uchicago.edu/research/argonne-rezzy-ai-support-chatbot-for-ev-charger-reservation-app-evrez/ | ✓ 已爬取 |
| 2 | https://datascience.uchicago.edu/research/inference-analytics-automated-icd-10-code-prediction-for-healthcare-reports-using-large-language-models/ | ✓ 已爬取 |
| 3 | https://datascience.uchicago.edu/research/research-gpt-for-healthcare-mcp-driven-multi-agent-rag-enhanced-llm-system-for-prostate-cancer-temporal-summarization/ | ✓ 已爬取 |
| 4 | https://datascience.uchicago.edu/research/global-iq-optimizing-roi-of-global-talent-mobility-through-predictive-modeling-and-optimization-for-corporate-programs-policies/ | ✓ 已爬取 |
| 5 | https://datascience.uchicago.edu/research/research-gpt-for-healthcare-applications-of-generative-ai-in-emergency-department-admission-evaluation/ | ✓ 已爬取 |
| 6 | https://datascience.uchicago.edu/research/chicago-white-sox-measuring-pitcher-deception-and-command-using-motion-tracking-data/ | ✓ 已爬取 |
| 7 | https://datascience.uchicago.edu/research/aetna-optimization-engine-creation-scenario-planning-and-sensitivity-analysis-tool/ | ✓ 已爬取 |
| 8 | https://datascience.uchicago.edu/research/latentview-analytics-visual-defect-detection/ | ✓ 已爬取 |
| 9 | https://datascience.uchicago.edu/research/here-technologies-vehicle-perception-data-vpd-and-here-lane-model-alignment/ | ✓ 已爬取 |
| 10 | https://datascience.uchicago.edu/research/ateema-ai-driven-media-kit/ | ✓ 已爬取 |
| 11 | https://datascience.uchicago.edu/research/tokio-marine-highland-flood-risk-rating-of-a-property-leveraging-digital-elevation-model/ | — 未爬取 |
| 12 | https://datascience.uchicago.edu/research/here-technologies-ai-powered-feature-extraction-from-street-level-imagery-for-automated-mapmaking/ | — 未爬取 |
| 13 | https://datascience.uchicago.edu/research/charactour-ai-developing-a-personality-driven-generative-ai-model-for-capturing-diverse-linguistic-styles/ | — 未爬取 |
| 14 | https://datascience.uchicago.edu/research/united-airlines-intelligent-airport-agent-for-enhanced-gate-service/ | — 未爬取 |
| 15 | https://datascience.uchicago.edu/research/research-gpt-for-healthcare-concordagent-an-integrated-ai-agent-for-ultrasound-pathology/ | — 未爬取 |
| 16 | https://datascience.uchicago.edu/research/rakuten-graphrag-or-similar-llm-applications-for-analyzing-advertiser-and-publisher-partnership/ | — 未爬取 |
| 17 | https://datascience.uchicago.edu/research/here-technologies-ensuring-map-freshness-with-an-ai-powered-places-data-pipeline/ | — 未爬取 |
| 18 | https://datascience.uchicago.edu/research/grai-matter-total-value-of-workforce-tvow/ | — 未爬取 |
| 19 | https://datascience.uchicago.edu/research/argonne-lead-vehicle-distance-estimation-using-forward-vision-in-ego-vehicles/ | — 未爬取 |
| 20 | https://datascience.uchicago.edu/research/inference-analytics-healthcare-specialized-llm-with-reinforcement-learning/ | — 未爬取 |
| 21 | https://datascience.uchicago.edu/research/research-gpt-for-healthcare/ | — 未爬取 |
| 22 | https://datascience.uchicago.edu/research/aetna-optimization-engine-creation-multi-objective-optimization-model/ | — 未爬取 |
| 23 | https://datascience.uchicago.edu/research/healthlab-innovations-inc-continuity-engines-unlock-dark-data-to-save-lives-through-ai-driven-follow-ups/ | — 未爬取 |
| 24 | https://datascience.uchicago.edu/research/aetna-measuring-the-impact-of-diverse-marketing-campaigns-on-medicare-stars-performance/ | — 未爬取 |
| 25 | https://datascience.uchicago.edu/research/global-iq-optimizing-roi-of-global-talent-mobility-through-llm-based-corporate-employee-decision-support/ | — 未爬取 |
| 26 | https://datascience.uchicago.edu/research/rakuten-llm-driven-large-scale-scraping-and-competitive-marketing-strategy/ | — 未爬取 |
| 27 | https://datascience.uchicago.edu/research/inference-analytics-ai-powered-scientific-research-assistant/ | — 未爬取 |
| 28 | https://datascience.uchicago.edu/research/lexlead-ai-legal-services-recommendation-system/ | — 未爬取 |
| 29 | https://datascience.uchicago.edu/research/research-gpt-for-healthcare-agentic-clinical-rag-model-context-protocol-based-framework/ | — 未爬取 |
| 30 | https://datascience.uchicago.edu/research/healthlab-innovations-inc-synergy-engines-unlocking-business-strategies-with-ai-4000-digital-health-companies/ | — 未爬取 |
| 31 | https://datascience.uchicago.edu/research/aetna-developing-a-predictive-medicare-grievance-model-for-cms-star-ratings-improvement/ | — 未爬取 |
| 32 | https://datascience.uchicago.edu/research/global-iq-optimizing-roi-of-global-talent-mobility-through-predictive-modeling-and-optimization-of-employee-compensation/ | — 未爬取 |
| 33 | https://datascience.uchicago.edu/research/research-robotics-enders-game4/ | — 未爬取 |
| 34 | https://datascience.uchicago.edu/research/uniqlo-china-enhancing-actionability-of-external-market-data-with-ai/ | — 未爬取 |
| 35 | https://datascience.uchicago.edu/research/labelmaster-digital-marketing-alchemy-unlocking-data-driven-success-or-the-roi-playbook-mastering-ads-emails-web-traffic/ | — 未爬取 |
| 36 | https://datascience.uchicago.edu/research/royal-cyber-llm-powered-auto-grading-assignment-with-feedback/ | — 未爬取 |
| 37 | https://datascience.uchicago.edu/research/research-gpt-for-healthcare-reinforcement-learning-driven-multi-agent-framework-for-unifying-clinical-imaging-and-text-retrieval/ | — 未爬取 |
| 38 | https://datascience.uchicago.edu/research/global-iq-soup-to-nuts-creating-a-global-living-wage-data-product/ | — 未爬取 |
| 39 | https://datascience.uchicago.edu/research/research-robotics-robartists4/ | — 未爬取 |

### optional — pattern 匹配 `/research/{slug}/`（47+ 个）

raw 中存在大量非 sitemap 列出的 `/research/[slug]` 页面，命中 url_patterns 中 `optional` 规则。  
见 sitemap §2 中标注 `[optional via pattern]` 的条目。

### dsi-general（7 个 Hub + footer/header 导航链接）— DSI 顶层页面

> ADS 项目属于 DSI 组织体系，这 7 个顶层 Hub 页面标记为 `dsi-general`，表示可选择性纳入以提供 ADS 项目背景知识。其余 DSI 子页面一律 `skip`（`/about/*`、`/outreach/*` 已在 url_patterns 中设 catch-all skip 规则）。此外，`data/raw_scraped_pages/footer.json` 中 `links[]` 的所有 `href` 亦归入 `dsi-general`（见 §3 Header/Footer 分类及 §7 Recommended Scrape List）。

| URL | raw 状态 |
|-----|---------|
| https://datascience.uchicago.edu/ | ✓ 在 raw 中 |
| https://datascience.uchicago.edu/about/ | ✓ 在 raw 中 |
| https://datascience.uchicago.edu/about/about-dsi/ | ✓ 在 raw 中 |
| https://datascience.uchicago.edu/education/ | ✓ 在 raw 中|
| https://datascience.uchicago.edu/research/ | ✓ 已爬取 |
| https://datascience.uchicago.edu/insights/ | ✓ 在 raw 中|
| https://datascience.uchicago.edu/outreach/ | ✓ 在 raw 中|

### skip — 精确 URL（在 raw 中出现，确认为范围外）

| URL |
|-----|
| https://datascience.uchicago.edu/about/leadership-staff/ |
| https://datascience.uchicago.edu/fellows-and-scholars/ |
| https://www.uchicago.edu/en/education-and-research/academic-calendar |

### alias（raw 中**未**出现，仅供 metadata 存档）

> 经核查：5 个 alias URL 均不在 raw_scraped_pages 中。爬虫只抓了 canonical URL，alias 从未出现在 page_url / source_url 字段里。

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

### DSI 站点导航 / Hub 页

> 以下条目中，带 `[dsi-general]` 标记的已升为 `dsi-general` 并移入 §1；其余建议 `skip`。

- https://datascience.uchicago.edu → **[dsi-general]** 已移入 §1
- https://datascience.uchicago.edu/education → **[dsi-general]** 已移入 §1
- https://datascience.uchicago.edu/about → **[dsi-general]** 已移入 §1
- https://datascience.uchicago.edu/about/about-dsi → **[dsi-general]** 已移入 §1
- https://datascience.uchicago.edu/insights → **[dsi-general]** 已移入 §1
- https://datascience.uchicago.edu/outreach → **[dsi-general]** 已移入 §1（sub-pages covered by /outreach/* skip pattern）
- https://datascience.uchicago.edu/education/masters-programs
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

### Pattern `/people/{slug}/` — 约 52 个，raw 中无独立文件（已决策：不补爬）

sitemap 将 `/people/{slug}/` 标记为 `priority: optional`，共约 52 个 faculty/staff 页面。  
**raw 中无任何 `/people/` 路径的 JSON 文件。**

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

**人工Review结果：** /people/ URL 的信息可以在/instructors-staff/的page的Accordion里看到，且用户一般无法点击到 /people/ URL，所以不做进一步爬取。

---

## 4. 统计汇总

| 分类 | 条目数（sitemap） | 在 raw 中找到 | 缺失 |
|------|-----------------|--------------|------|
| must | 14 | 14 ⚠️ | 0（含 1 条需规范化尾斜杠） |
| dsi-general | 7 | 7 | 0（均在 raw 中，部分原为 unlisted） |
| optional（/people/ pattern） | ~52 | 0 | ~52（已决策：不补爬） |
| optional（精确 D3，ADS capstone） | 39 | 10 ⚠️ | 29（尚未爬取；含尾斜杠规范化问题） |
| optional（/research/ pattern） | — | 47+ | — |
| skip（精确） | 3 | 3 | — |
| alias | 5 | 0（raw 未爬取 alias URL） | — |
| **unlisted（raw 中出现但不在 sitemap）** | — | **~93** | — |
| **raw 总文件数** | — | **177** | — |

---

## 5. 行动建议

| 优先级 | 行动 |
|--------|------|
| 🟡 High | 清洗脚本在 URL 对照前统一规范化末尾斜杠（`url.rstrip('/') + '/'`） |
| 🟡 High | 确认 footer.json 的处理方式：其 `source_url` 字段值为首页 URL，非标准 page_url，建议在清洗时跳过 |
| 🟢 Medium | 对 §2 unlisted 列表逐条决策 skip 或补进 sitemap（大量 outreach/research hub 页可直接 skip） |
| 🟢 Low | 对 47+ 命中 `/research/{slug}/` pattern 的非 sitemap 研究页面决策是否纳入 optional |
