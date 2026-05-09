# UChicago MSADS Hybrid Retrieval 项目说明

说明：本文件是 UTF-8 编码。如果你在 PowerShell 里用 `Get-Content` 看到中文乱码，那通常是终端显示编码问题，不是文件内容坏了。

这个项目目前只做到 **retrieval 检索层**，还没有进入最终问答生成。

也就是说，现在的目标不是让 LLM 直接回答问题，而是先验证：

```text
用户问一个问题
  -> 系统能不能从 MSADS 网页资料里找出正确、相关、有来源的 evidence chunks
```

等 retrieval 质量稳定后，下一步再把检索出来的 chunks 交给 Ollama 的 `qwen3:8b` 生成最终答案。

## 1. Overview：整体框架

整个系统分成两个阶段：

```text
阶段 A：离线 build index

raw/ 原始网页 JSON
  -> 清洗 HTML
  -> 建 DOM-aware knowledge graph
  -> 生成 retrieval chunks
  -> 生成 vector embeddings
  -> 生成 BM25 keyword index
  -> 写入 processed/ 和 index/


阶段 B：在线 retrieve

用户 query
  -> query embedding
  -> vector retrieval
  -> keyword/BM25 retrieval
  -> graph retrieval
  -> intent boost
  -> hybrid ranking
  -> 返回 top-k evidence chunks
```

对应两个入口脚本：

```text
build_index.py   负责阶段 A
retrieve.py      负责阶段 B
```

## 2. 为什么要做 Knowledge Graph

你一开始提出的 KG 不是传统的实体关系图，比如：

```text
Course -> TAUGHT_BY -> Instructor
```

而是更适合网页 RAG 的 **网页结构图**：

```text
MSADS
  -> Page
    -> Section
      -> Accordion
        -> AccordionItem
          -> Chunk
```

核心原因是：这些网页里有很多信息不是普通段落，而是藏在：

- accordion 展开项
- tab-like 页面组件
- 表格或伪表格
- 页面 section
- course list
- FAQ item

所以 KG 的作用不是“自动猜实体关系”，而是保留网页真实结构：

```text
这个 chunk 属于哪个 page？
属于哪个 section？
属于哪个 accordion item？
这个 accordion item 的标题是什么？
来源 URL 是什么？
```

这样 retrieval 时可以利用结构信息。

例如用户问：

```text
What are the core courses for the in-person MSADS program?
```

系统不仅看 chunk 文本，也会看 graph path：

```text
In-Person Program > Core Courses > Accordion
```

这就是 graph retrieval 的价值。

## 3. 很重要的设计原则：不用 heading 大小强行推层级

网页里的 `h1/h2/h3` 不一定代表真实内容层级。很多网站会出于展示目的改变 heading 样式。

所以本项目尽量不做这种简单假设：

```text
看到一个 h2
  -> 后面所有内容都属于它
```

而是优先看真实 DOM 结构：

```text
这个内容是不是被包在同一个 section/div/accordion item 里面？
这个内容是不是 accordion-content？
这个 tab 是否通过 aria-controls 指向某个 panel？
这个 table row 是否真的在 table 里面？
```

简单说：

```text
heading 主要用于命名节点
DOM containment 才用于判断 parent-child 关系
```

## 4. 运行顺序

### 第一步：build index

运行：

```powershell
C:\Python\Anaconda\envs\adsp-nlp-backup\python.exe build_index.py --embedding-backend auto
```

这一步会读取 `raw/`，然后生成：

```text
processed/index.html
processed/chunks/<page>.json
processed/pages/<page>.html
processed/pages/<page>.json
processed/pages/<page>.md
index/knowledge_graph.json
index/chunks.json
index/chroma/
index/bm25.pkl
index/index_meta.json
```

目前推荐的 embedding 方式是：

```text
BAAI/bge-small-en-v1.5
```

它通过 Hugging Face / sentence-transformers 在 Python 里直接加载，不需要 Ollama。

Ollama 目前主要用于后续回答生成：

```text
qwen3:8b
```

### 第二步：测试 retrieval

运行：

```powershell
C:\Python\Anaconda\envs\adsp-nlp-backup\python.exe retrieve.py "What are the core courses for the in-person MSADS program?" --top-k 8
```

更多测试：

```powershell
C:\Python\Anaconda\envs\adsp-nlp-backup\python.exe retrieve.py "tuition cost per course amount" --top-k 5
C:\Python\Anaconda\envs\adsp-nlp-backup\python.exe retrieve.py "Is the MSADS program eligible for STEM OPT visa?" --top-k 5
C:\Python\Anaconda\envs\adsp-nlp-backup\python.exe retrieve.py "application deadlines for MS in Applied Data Science" --top-k 5
C:\Python\Anaconda\envs\adsp-nlp-backup\python.exe retrieve.py "FAQ TOEFL IELTS requirement international students" --top-k 5
```

输出里你会看到：

```text
rank
final score
page title
graph path
source URL
vector score
keyword score
graph score
intent boost
retrieved text
```

这些都是为了帮助你判断 retrieval 质量。

## 5. Hybrid Retrieval 是怎么融合的

`retrieve.py` 最后会算一个综合分：

```text
final_score =
  vector_weight  * vector_score
  keyword_weight * keyword_score
  graph_weight   * graph_score
  intent_boost
```

默认权重：

```text
vector_weight  = 0.50
keyword_weight = 0.30
graph_weight   = 0.20
```

### vector_score

语义相似度。

例如：

```text
query: career outcome
chunk: graduates work in data science roles...
```

即使词不完全一样，embedding 也可能认为它们相关。

### keyword_score

BM25 关键词匹配。

它对这些查询尤其有用：

```text
deadline
tuition
TOEFL
IELTS
OPT
visa
capstone
```

因为这些词需要精确命中。

### graph_score

结构匹配。

它看 query 里的词是否出现在 chunk 的图路径里：

```text
Page > Section > AccordionItem
```

例如：

```text
In-Person Program > Core Courses > Machine Learning I
```

用户问 `core courses` 时，这个 chunk 即使正文里没有重复很多次 `core courses`，也能因为 path 相关而得分。

### intent_boost

这是一个小的人工排序增强。

比如：

- 如果 query 问 `deadline`，包含具体日期和 `Application Deadline` 的 chunk 会加分。
- 如果 query 问 `tuition/cost/fees`，包含 `$` 或 `tuition` 的 chunk 会加分。
- 如果 query 问 `core courses`，accordion 课程目录 chunk 会加分。
- 如果 query 问 `STEM/OPT/visa`，包含这些词的 chunk 会加分。

它不是 LLM，也不是答案生成，只是帮助 retrieval 排序更符合用户意图。

## 6. Folder 解释

### `raw/`

这是输入数据目录。

里面每个 JSON 对应一个网页。

每个文件大概长这样：

```json
{
  "url": "...",
  "fetched_at": "...",
  "http_status": 200,
  "page_class": "must",
  "url_aliases": [],
  "html": "<!DOCTYPE html>..."
}
```

本项目目前只使用里面的 `html` 来重新解析网页结构。

### `processed/`

这是给人看的中间结果。

它的作用是让你检查：

```text
网页有没有被清洗对？
KG 结构有没有建对？
chunks 切得合不合理？
accordion 有没有被识别？
source URL 和 path 有没有保留下来？
```

文件：

```text
processed/index.html
processed/chunks/<page>.json
processed/pages/<page>.html
processed/pages/<page>.json
processed/pages/<page>.md
```

推荐 debug 顺序：

```text
1. 先打开 processed/index.html
   这是可视化入口，列出每个 page、chunk 数量和 debug 链接。

2. 再打开 processed/pages/<page>.html
   这是最适合人看的版本，左边是可折叠 graph tree，右边是 chunks。

3. 如果你想看原始结构，再看 processed/pages/<page>.json
   这是单个 page 的 graph tree + chunks。

4. 如果你只想检查 retrieval 文本块，再看 processed/chunks/<page>.json
   这是单个 page 的 chunks，适合检查 retrieval 到底会看到哪些文本块。
```

例如想 debug In-Person Program 页面，优先看：

```text
processed/index.html
processed/pages/in_person_program.html
processed/chunks/in_person_program.json
```

### `index/`

这是给程序检索时用的索引目录。

文件：

```text
index/knowledge_graph.json
index/chunks.json
index/chroma/
index/bm25.pkl
index/index_meta.json
```

完整 flat graph 和完整 chunks 不再放在 `processed/` 里。

原因是：

```text
processed/ 只服务人工 debug
index/     只服务机器检索
```

所以完整机器索引保留在：

```text
index/knowledge_graph.json
index/chunks.json
```

### `grag/`

这是项目内部 Python package。

里面放可复用模块，供 `build_index.py` 和 `retrieve.py` 调用。

你可以理解为：

```text
build_index.py 和 retrieve.py 是入口
grag/ 里面是具体工具箱
```

## 7. 每个 Python 文件做什么

### `build_index.py`

这是离线构建入口。

它调用关系大概是：

```text
build_index.py
  -> grag.kg_builder.build_graph()
  -> grag.embeddings.choose_embedder()
  -> grag.bm25.BM25Index()
  -> grag.index_io.write_json/write_pickle()
```

它负责：

1. 读取 `raw/`
2. 调用 KG builder 清洗网页并建图
3. 把 chunks 转成 embedding vectors
4. 建 BM25 keyword index
5. 写出 `processed/` 和 `index/`

你什么时候运行它？

```text
raw/ 变了
清洗规则变了
KG 构建逻辑变了
embedding 模型变了
```

这些情况都要重新运行 `build_index.py`。

### `retrieve.py`

这是查询入口。

它调用关系大概是：

```text
retrieve.py
  -> grag.index_io.read_json/read_pickle()
  -> grag.embeddings.choose_embedder()
  -> BM25Index.scores()
  -> graph_scores()
  -> intent_boosts()
```

它负责：

1. 读取 `index/`
2. 把用户 query 变成 embedding
3. 算 vector_score
4. 算 keyword_score
5. 算 graph_score
6. 算 intent_boost
7. 融合排序并输出 top-k chunks

### `grag/kg_builder.py`

这是最核心的结构化模块。

它负责把 HTML 变成：

```text
knowledge graph
retrieval chunks
```

关键函数：

```text
build_graph()
parse_container()
parse_element()
parse_accordion()
parse_table()
parse_tab_group()
```

核心逻辑：

```text
HTML
  -> 删除噪声
  -> 找 main
  -> Page node
  -> Section / Accordion / AccordionItem / Table / Tab node
  -> Chunk node
```

它也是你最应该认真读的文件，因为这里体现了这个项目对网页结构的理解。

### `grag/embeddings.py`

负责 embedding。

它支持三种方式：

```text
SentenceTransformerEmbedder  推荐，使用 Hugging Face bge-small
OllamaEmbedder               可选，走 Ollama HTTP API
TfidfSvdEmbedder             兜底，不是深度 embedding
```

目前推荐：

```text
BAAI/bge-small-en-v1.5
```

这个模型通过 Python 的 `sentence-transformers` 加载。

注意：

```text
build index 时用什么 embedding
retrieve query 时也必须用同一个 embedding
```

否则 query 向量和 chunk 向量不在同一个空间里，结果会乱。

### `grag/bm25.py`

负责 keyword retrieval。

BM25 的作用是给精确词加检索能力。

例如：

```text
deadline
tuition
TOEFL
IELTS
STEM
OPT
visa
```

这些词如果只靠 vector retrieval，可能会被语义相似但不精确的内容干扰。

### `grag/text.py`

文本工具。

负责：

```text
clean_text()
tokenize()
chunk_words()
```

它被多个模块复用：

```text
kg_builder.py 用它清洗文本和切 chunk
bm25.py 用它 tokenize
retrieve.py 用它做 graph scoring
```

### `grag/index_io.py`

文件读写工具。

负责：

```text
JSON 读写
pickle 读写
index/ 文件路径统一管理
```

### `grag/__init__.py`

让 `grag/` 成为 Python package。

它本身不做算法，只是为了可以写：

```python
from grag.kg_builder import build_graph
```

## 8. 代码之间的关系图

```text
build_index.py
  |
  |-- grag/kg_builder.py
  |     |-- grag/text.py
  |
  |-- grag/embeddings.py
  |
  |-- grag/bm25.py
  |     |-- grag/text.py
  |
  |-- grag/index_io.py


retrieve.py
  |
  |-- grag/index_io.py
  |
  |-- grag/embeddings.py
  |
  |-- grag/text.py
  |
  |-- index/chunks.json
  |-- index/knowledge_graph.json
  |-- index/chroma/
  |-- index/bm25.pkl
```

## 9. 当前状态

当前项目已经完成：

```text
网页 HTML 清洗
DOM-aware KG 构建
accordion item 识别
retrieval chunks 构建
Hugging Face bge-small embedding 支持
BM25 keyword retrieval
graph retrieval
hybrid ranking
命令行 retrieve 测试
```

还没有完成：

```text
把 retrieved chunks 交给 qwen3:8b 生成最终答案
答案引用 source URL
多轮 agent
前端 UI
```

## 10. 下一步建议

下一步可以做：

```text
retrieve.py top-k chunks
  -> context packer
  -> Ollama qwen3:8b
  -> answer with citations
```

也就是在 retrieval 后面加一个回答生成层。

但在那之前，建议先多测一些 query，看看 top-k evidence 是否靠谱。
