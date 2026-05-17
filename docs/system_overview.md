# System Overview — RAG-based Interactive AI for MSADS Website

---

## 1. End-to-End Pipeline

Data flows from offline index construction (top) into the runtime query path (bottom). Hybrid retrieval and the agent loop are expanded in full detail.

```mermaid
flowchart TD
    %% Offline index construction
    subgraph OFFLINE["Offline — Index Construction"]
        SCRAPE["Playwright scraper\n30+ JS-rendered pages"]
        RAW["raw/  HTML + URL per page"]
        KG["kg_builder.py\nPage - Section - Accordion - Chunk\n~400 tokens per chunk"]
        CHR["ChromaDB\nbge-small-en-v1.5 embeddings"]
        BM25S["BM25 sparse index\nbm25.pkl"]
        IDX["index/\nchunks.json  knowledge_graph.json  bm25.pkl"]
        SCRAPE -->|raw HTML| RAW --> KG
        KG -->|chunk texts| CHR
        KG -->|chunk texts| BM25S
        CHR --> IDX
        BM25S --> IDX
    end

    %% Runtime entry
    USER["User Query"]
    API["FastAPI\nPOST /chat/stream"]
    QR["Query Rewriter\nsplit compound questions\ninto retrieval-ready sub-queries"]
    USER --> API --> QR

    %% Hybrid Retrieval
    subgraph HYBRID["Hybrid Retrieval — retriever.py"]
        VEC["[1] Vector search\nChromaDB cosine similarity\nbge-small-en-v1.5"]
        BM25Q["[2] BM25 keyword search\nsparse token overlap"]
        GSCORE["[3] Graph path score\nproximity in KG tree\ngraph_tools.py"]
        INTENT["[4] Intent classifier\nadmission / tuition / course / career"]
        NORM["Min-max normalize each score independently"]
        FUSE["Weighted sum  vec + bm25 + graph"]
        BOOST["Intent boost  multiplicative"]
        TOPK["Top-K chunks  K=8\nwith ancestral path + source URL"]
        VEC --> NORM
        BM25Q --> NORM
        GSCORE --> NORM
        NORM --> FUSE
        FUSE --> BOOST
        INTENT --> BOOST
        BOOST --> TOPK
    end

    IDX -->|embeddings| VEC
    IDX -->|bm25.pkl| BM25Q
    IDX -->|knowledge_graph.json| GSCORE
    QR -->|sub-queries| HYBRID

    %% Agent Loop — flat, no nested subgraph
    subgraph AGENT["Agent Loop — agent_loop.py  max 9 steps"]
        DEC["Agent Decision LLM\nqwen3:8b  JSON mode\nchoose next tool"]
        T1["hybrid_retrieve\nprimary retrieval"]
        T2["list_page_summaries\nfind relevant pages"]
        T3["inspect_page\nshow KG tree of a page"]
        T4["fetch_node_chunks\npull chunks from KG node"]
        T5["fetch_chunk\nsingle chunk full text"]
        JUDGE["Evidence Judge LLM\nqwen3:8b  JSON mode\nkeep_chunks  sufficient: bool"]
        MEM["AgentMemory\naccumulated evidence items"]
        DEC --> T1
        DEC --> T2
        DEC --> T3
        DEC --> T4
        DEC --> T5
        T1 --> JUDGE
        T2 --> JUDGE
        T3 --> JUDGE
        T4 --> JUDGE
        T5 --> JUDGE
        JUDGE -->|keep chunks| MEM
        JUDGE -->|not sufficient| DEC
    end

    TOPK -->|initial chunks| T1
    HYBRID -.->|re-query on subsequent calls| T1

    %% Answer + Response
    ANGEN["Answer Generator\nchat_text  free-form\n[1][2] citation markers"]
    JUDGE -->|sufficient or max steps| ANGEN
    MEM --> ANGEN
    ANGEN -->|SSE token stream + Citations JSON| API

    %% Frontend
    FE["React Frontend\nChat bubble  Sources panel  citation highlighting"]
    API -->|SSE done event| FE

    %% Eval side branch
    EVAL["RAGAS Eval\n30 curated Q&A pairs\nFaithfulness  Relevancy  Precision  Recall"]
    API -.->|offline batch run| EVAL

    style HYBRID fill:#f5f0ff,stroke:#4e2a84
    style AGENT  fill:#fff5f5,stroke:#9e1b32
    style OFFLINE fill:#f0f0f0,stroke:#767676
    style JUDGE  fill:#9e1b32,color:#fff
    style ANGEN  fill:#4e2a84,color:#fff
    style TOPK   fill:#4e2a84,color:#fff
```

---

## 2. Knowledge Graph Structure

Content is parsed from raw HTML into a five-level DOM-aware hierarchy. Each `Chunk` is a leaf node (~400 tokens) that inherits the full ancestral path.

```mermaid
graph TD
    PAGE["Page\ne.g. How to Apply"]
    SEC["Section\ne.g. Application Requirements"]
    ACC["AccordionGroup / TabGroup"]
    ITEM["AccordionItem\ne.g. Letters of Recommendation"]
    CHUNK["Chunk\n~400 tokens · leaf node"]

    PAGE --> SEC
    SEC --> ACC
    ACC --> ITEM
    ITEM --> CHUNK

    style CHUNK fill:#4e2a84,color:#fff
    style PAGE fill:#767676,color:#fff
```

---

## 3. Hybrid Retrieval Score Fusion

Three signals are computed independently, min-max normalized, then summed. An intent boost is applied multiplicatively before returning top-K chunks.

```mermaid
flowchart TD
    Q["User Query"]

    Q --> VEC["Vector search\nChromaDB · bge-small-en-v1.5"]
    Q --> BM25["Keyword search\nBM25 sparse index"]
    Q --> GRAPH["Graph score\npath proximity in KG"]
    Q --> INTENT["Intent classifier\nadmission / tuition / course / career"]

    VEC --> NORM["Min-max normalization"]
    BM25 --> NORM
    GRAPH --> NORM

    NORM --> SUM["Weighted sum"]
    INTENT -->|"multiplicative boost"| SUM

    SUM --> TOPK["Top-K chunks\ndefault K = 8"]
```

---

## 4. Agent Loop

The agent iterates up to 9 tool calls. After each call the Evidence Judge decides whether to keep retrieved chunks and whether accumulated evidence is sufficient to generate an answer.

```mermaid
flowchart TD
    UQ["User Query"]

    UQ --> QR["Query Rewriter\nexpand / split compound questions"]
    QR --> AD["Agent Decision LLM\nchoose next tool"]

    AD --> TOOL{"Tool dispatch"}
    TOOL --> T1["hybrid_retrieve\nprimary retrieval"]
    TOOL --> T2["list_page_summaries\nidentify relevant pages"]
    TOOL --> T3["inspect_page\nshow KG structure tree"]
    TOOL --> T4["fetch_node_chunks\npull chunks from KG node"]
    TOOL --> T5["fetch_chunk\nsingle chunk full text"]

    T1 & T2 & T3 & T4 & T5 --> JUDGE["Evidence Judge LLM\nkeep_chunks · sufficient?"]

    JUDGE -->|"not sufficient\n(≤ 9 steps)"| AD
    JUDGE -->|"sufficient\nor max steps reached"| AGEN["Answer Generator\ncited prose · [1][2] markers"]

    AGEN --> RESP["ChatResponse\nanswer + Citations"]

    style JUDGE fill:#9e1b32,color:#fff
    style AGEN fill:#4e2a84,color:#fff
```

---

## 5. Frontend–Backend Communication

The React SPA talks to FastAPI over two endpoints. Streaming tokens are delivered via Server-Sent Events; citations are sent in the final `done` event.

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant FE as React Frontend
    participant VITE as Vite Proxy
    participant API as FastAPI (app.py)
    participant AGENT as Agent Loop
    participant LLM as qwen3:8b (Ollama)

    U->>FE: Type question + press Send
    FE->>VITE: POST /api/chat/stream
    VITE->>API: POST /chat/stream (proxy)
    API->>AGENT: run_agent(query, history)

    loop Agent steps (≤ 9)
        AGENT->>LLM: Decision / Judge / Rewrite
        LLM-->>AGENT: JSON response
    end

    AGENT->>LLM: Answer generation (chat_text)
    LLM-->>AGENT: token stream

    loop SSE token deltas
        API-->>FE: data: {"delta": "..."}
        FE-->>U: Append token to chat bubble
    end

    API-->>FE: data: {"done": true, "answer": "...", "citations": [...]}
    FE-->>U: Replace bubble · populate Sources panel
```

---

## 6. RAGAS Evaluation Pipeline

```mermaid
flowchart LR
    EQ["docs/eval_queries.json\n30 curated Q&A pairs"]
    CACHE["docs/agent_run_cache.json\nfile-based run cache"]

    EQ --> NB["ragas_eval.ipynb"]
    CACHE <-->|"read / write"| NB

    NB --> AGENT2["Full Agent\n(same as production)"]
    AGENT2 --> RAGAS["RAGAS scorer\nqwen3:8b via LangChain"]

    RAGAS --> M1["Faithfulness"]
    RAGAS --> M2["Answer Relevancy"]
    RAGAS --> M3["Context Precision"]
    RAGAS --> M4["Context Recall"]

    M1 & M2 & M3 & M4 --> CSV["docs/ragas_results.csv"]
```

---

## 7. Component Dependency Map

```mermaid
graph LR
    APP["app.py"] --> AL["agent/agent_loop.py"]
    APP --> OC["agent/ollama_client.py"]

    AL --> QR2["agent/query_rewriter.py"]
    AL --> TOOLS2["agent/tools.py"]
    AL --> JUDGE2["Evidence Judge\n(ollama_client)"]
    AL --> AG2["agent/answer_generator.py"]
    AL --> LOG["agent/logger.py"]

    TOOLS2 --> RET2["grag/retriever.py"]
    TOOLS2 --> GT2["grag/graph_tools.py"]

    RET2 --> CHR2["grag/chroma_store.py"]
    RET2 --> BM2["grag/bm25.py"]
    RET2 --> GT2

    CHR2 --> EMB2["grag/embeddings.py"]
    CHR2 & BM2 & GT2 --> IIO["grag/index_io.py"]

    style APP fill:#9e1b32,color:#fff
    style AL fill:#4e2a84,color:#fff
```
