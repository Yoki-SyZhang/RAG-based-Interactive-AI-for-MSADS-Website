# RAG-based-Interactive-AI-for-MSADS-Website

## Project Context

The project aims to develop a RAG-based conversational AI system that can efficiently retrieve and generate accurate responses to inquiries about the MS in Applied Data Science program at the University of Chicago. The system will leverage both textual data from the program’s webpage and a pre-trained LLM to provide detailed, context-aware answers.

Knowledge base source: https://datascience.uchicago.edu/education/masters-programs/ms-in-applied-data-science/

## Repository Structure

```
.
├── README.md                        # this file
├── data/
│   ├── raw_scraped_pages/           # 爬虫原始输出，176个page_*.json + footer.json
│   │   ├── footer.json
│   │   ├── page_001.json
│   │   └── ...
│   └── cleaned_sections/            # Stage 1 输出，14个must页面，每页一个JSON
│       ├── page_042_cleaned.json
│       └── ...
│
├── interim/                         # 中间产物
│   ├── homepage_step1.json          # 网页爬取sample
│   └── sitemap.json                 # sitemap flat records
│
├── docs/
│   ├── requirements/
│   │   └── Class project-1 Midterm Project.pdf
│   ├── sitemap_description.md       # sitemap说明
│   ├── url_classification.json      # 手工标注的URL分类规则表
│   └── url_class_reference.json     # 筛选后作为参考的URL分类结果
│
├── scripts/
│   ├── Stage1_data_processing/
│   │   ├── uchicago_spider_step1.py     # BFS-crawl the site，输出sitemap
│   │   ├── uchicago_spider_step2.py     # 按URL逐页爬取，写入raw_scraped_pages/
│   │   └── clean_for_structure.ipynb    # Stage 1主notebook：分类、清洗、结构化、导出
│   │
│   ├── Stage2_vectorDB/
│   ├── Stage3_LLM_agent/
│   └── Stage4_UI/
│
└── reports/
    ├── page_inventory.md            # 核对已爬取的pages和sitemap的出入，指导url_classification.json的撰写
    └── Stage1_complete_report.md    # Stage 1完整说明：各节功能、输出schema、设计决策
```


## Project Breakdown

```
1. 数据准备
    1. 抓取 UChicago MS in Applied Data Science 项目网页及其子页面的信息
    （包括项目介绍、课程、faculty、admission、career resources 等）
        1. 网站结构梳理
        2. 爬虫
    2. 清洗  
        1. 去除爬虫artifacts
    3. 结构化 
        1. 要有meta data作为LLM回答时候的quotation
2. 检索系统
    1. Chunking
    2. embedding 
    3. 存进vector DB 做 retrieval（如 Chroma / FAISS / Pinecone）
3. 问答生成
    1. 把检索结果喂给 LLM，做 RAG 问答
        1. System instruction的设计
    2. 保证回答尽量 grounded 
        1. 可能需要ground truth
        2. 指标评估：
            1. retrieval accuracy 
            2. response relevance 
4. 前端界面
    1. 做一个简单可用的界面，比如 Streamlit 或 Flask，让用户输入问题并实时得到回答。
    2. 测试一下效果 
5. 评估与交付
    1. 可运行 chatbot
    2. 指标评估结果
    3. Submission:
        1. 5页以上文档
        2. 10分钟 PPT

```