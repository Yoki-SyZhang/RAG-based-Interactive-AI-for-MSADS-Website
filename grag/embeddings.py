"""
Text-to-vector encoding backends for the RAG pipeline.

Provides three backends in priority order: SentenceTransformer (local HF cache),
Ollama, and TF-IDF/SVD fallback. Use choose_embedder() to get the best available one.
"""

import json
import urllib.error
import urllib.request
from typing import Iterable, List, Optional

import numpy as np


class Embedder:
    name = "base"

    def encode(self, texts: Iterable[str]) -> np.ndarray:
        raise NotImplementedError


class OllamaEmbedder(Embedder):
    def __init__(self, model: str = "nomic-embed-text", host: str = "http://localhost:11434") -> None:
        self.model = model
        self.host = host.rstrip("/")
        self.name = f"ollama:{model}"

    def _one(self, text: str) -> List[float]:
        payload = json.dumps({"model": self.model, "prompt": text}).encode("utf-8")
        req = urllib.request.Request(
            f"{self.host}/api/embeddings",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        return data["embedding"]

    def encode(self, texts: Iterable[str]) -> np.ndarray:
        vectors = [self._one(text) for text in texts]
        return normalize(np.asarray(vectors, dtype="float32"))


class SentenceTransformerEmbedder(Embedder):
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2") -> None:
        from sentence_transformers import SentenceTransformer

        self.model_name = model_name
        try:
            self.model = SentenceTransformer(model_name, local_files_only=True)
        except TypeError:
            self.model = SentenceTransformer(model_name)
        self.name = f"sentence-transformers:{model_name}"

    def encode(self, texts: Iterable[str]) -> np.ndarray:
        arr = self.model.encode(list(texts), normalize_embeddings=True, show_progress_bar=False)
        return np.asarray(arr, dtype="float32")


class TfidfSvdEmbedder(Embedder):
    def __init__(self, n_components: int = 256) -> None:
        from sklearn.decomposition import TruncatedSVD
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.pipeline import make_pipeline

        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1, stop_words="english")
        self.svd = TruncatedSVD(n_components=n_components, random_state=7)
        self.pipeline = make_pipeline(self.vectorizer, self.svd)
        self.name = f"tfidf-svd:{n_components}"
        self._fit = False

    def encode(self, texts: Iterable[str]) -> np.ndarray:
        texts = list(texts)
        if not self._fit:
            n_features = max(2, min(256, len(texts) - 1))
            self.svd.n_components = n_features
            arr = self.pipeline.fit_transform(texts)
            self._fit = True
        else:
            arr = self.pipeline.transform(texts)
        return normalize(np.asarray(arr, dtype="float32"))


def normalize(arr: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(arr, axis=1, keepdims=True)
    norms[norms == 0] = 1
    return arr / norms


def choose_embedder(preferred: str = "auto", ollama_model: str = "nomic-embed-text") -> Embedder:
    if preferred == "ollama":
        try:
            emb = OllamaEmbedder(model=ollama_model)
            emb.encode(["health check"])
            return emb
        except (OSError, urllib.error.URLError, KeyError, TimeoutError, ConnectionError):
            raise
    if preferred in {"auto", "sentence-transformers", "sbert"}:
        for model in [
            "BAAI/bge-small-en-v1.5",
            "sentence-transformers/all-MiniLM-L6-v2",
            "all-MiniLM-L6-v2",
        ]:
            try:
                return SentenceTransformerEmbedder(model)
            except Exception:
                continue
        if preferred in {"sentence-transformers", "sbert"}:
            raise RuntimeError("No local sentence-transformers model could be loaded.")
    if preferred == "auto":
        try:
            emb = OllamaEmbedder(model=ollama_model)
            emb.encode(["health check"])
            return emb
        except (OSError, urllib.error.URLError, KeyError, TimeoutError, ConnectionError):
            pass
    return TfidfSvdEmbedder()
