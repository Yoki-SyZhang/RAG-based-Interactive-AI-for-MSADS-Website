"""
本文件负责索引文件的读写路径管理。

它没有复杂算法，只是把重复的文件操作集中起来：
1. write_json/read_json：写入和读取 JSON。
2. write_pickle/read_pickle：写入和读取 Python pickle，比如 BM25 index。
3. manifest：统一定义 index/ 目录里每个文件叫什么。

这样 build_index.py 和 retrieve.py 不需要各自手写一套路径，减少文件名不一致的问题。
"""

import json
import pickle
from pathlib import Path
from typing import Any, Dict


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_pickle(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("wb") as f:
        pickle.dump(data, f)


def read_pickle(path: Path) -> Any:
    with path.open("rb") as f:
        return pickle.load(f)


def manifest(index_dir: Path) -> Dict[str, Path]:
    return {
        "graph": index_dir / "knowledge_graph.json",
        "chunks": index_dir / "chunks.json",
        "chroma": index_dir / "chroma",
        "bm25": index_dir / "bm25.pkl",
        "meta": index_dir / "index_meta.json",
        "page_summaries": index_dir / "page_summaries.json",
    }
