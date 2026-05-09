"""
本文件实现 keyword retrieval，也就是 BM25 检索。

为什么需要它：
vector retrieval 擅长语义相似，但对 deadline、tuition、OPT、TOEFL 这类精确词，
关键词匹配通常更稳。BM25 会根据 query 词在每个 chunk 里出现的情况给分。

这个项目没有额外安装 rank_bm25，所以这里写了一个很小的 BM25Index：
1. build_index.py 构建时，把所有 chunk 文本传进 BM25Index。
2. BM25Index 统计每个词在每个文档中的词频，以及全局 IDF。
3. retrieve.py 查询时调用 scores(query)，得到每个 chunk 的 keyword_score。
4. keyword_score 会和 vector_score、graph_score 一起融合排序。
"""

import math
from collections import Counter, defaultdict
from typing import Dict, Iterable, List

import numpy as np

from .text import tokenize


class BM25Index:
    def __init__(self, texts: Iterable[str], k1: float = 1.5, b: float = 0.75) -> None:
        self.k1 = k1
        self.b = b
        self.docs = [tokenize(text) for text in texts]
        self.doc_lens = np.asarray([len(doc) for doc in self.docs], dtype="float32")
        self.avgdl = float(self.doc_lens.mean()) if len(self.doc_lens) else 1.0
        self.term_freqs: List[Counter] = [Counter(doc) for doc in self.docs]
        df: Dict[str, int] = defaultdict(int)
        for doc in self.docs:
            for term in set(doc):
                df[term] += 1
        n = max(1, len(self.docs))
        self.idf = {
            term: math.log(1 + (n - freq + 0.5) / (freq + 0.5))
            for term, freq in df.items()
        }

    def scores(self, query: str) -> np.ndarray:
        terms = tokenize(query)
        scores = np.zeros(len(self.docs), dtype="float32")
        for term in terms:
            idf = self.idf.get(term)
            if idf is None:
                continue
            for i, freqs in enumerate(self.term_freqs):
                tf = freqs.get(term, 0)
                if tf == 0:
                    continue
                denom = tf + self.k1 * (1 - self.b + self.b * self.doc_lens[i] / self.avgdl)
                scores[i] += idf * (tf * (self.k1 + 1)) / denom
        return scores
