"""Thin Ollama HTTP client for the MSADS RAG agent."""

from __future__ import annotations

import json
import re
import time
import urllib.error
import urllib.request
from typing import Any, Dict, Iterator, List, Optional


OLLAMA_BASE_URL = "http://localhost:11434"
DEFAULT_MODEL = "qwen3:8b"
DEFAULT_NUM_CTX = 8192


def _strip_think(text: str) -> str:
    """Remove <think>...</think> blocks that qwen3 may emit."""
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()


def _post(url: str, payload: Dict[str, Any], timeout: int = 120) -> Dict[str, Any]:
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Ollama connection error: {exc}") from exc


class OllamaClient:
    def __init__(
        self,
        base_url: str = OLLAMA_BASE_URL,
        model: str = DEFAULT_MODEL,
        num_ctx: int = DEFAULT_NUM_CTX,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.num_ctx = num_ctx

    # ------------------------------------------------------------------
    # Public helpers
    # ------------------------------------------------------------------

    def chat_json(
        self,
        system: str,
        user: str,
        temperature: float = 0.0,
        timeout: int = 120,
    ) -> Dict[str, Any]:
        """Call Ollama with format=json; parse and return the JSON dict."""
        raw = self._chat(system, user, json_mode=True, temperature=temperature, timeout=timeout)
        text = _strip_think(raw)
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Try to extract first JSON object/array from text
            m = re.search(r"\{[\s\S]*\}", text)
            if m:
                try:
                    return json.loads(m.group(0))
                except json.JSONDecodeError:
                    pass
            raise ValueError(f"Ollama returned non-JSON output:\n{text[:500]}")

    def chat_text(
        self,
        system: str,
        user: str,
        temperature: float = 0.3,
        timeout: int = 180,
    ) -> str:
        """Call Ollama without format=json; return raw text."""
        return self._chat(system, user, json_mode=False, temperature=temperature, timeout=timeout)

    def chat_text_stream(
        self,
        system: str,
        user: str,
        temperature: float = 0.3,
        timeout: int = 300,
    ) -> Iterator[str]:
        """Stream content chunks from Ollama as they arrive.

        Yields plain string deltas. Caller is responsible for accumulation.
        """
        messages: List[Dict[str, str]] = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": user})

        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "stream": True,
            "options": {
                "temperature": temperature,
                "num_ctx": self.num_ctx,
            },
        }

        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        req = urllib.request.Request(
            f"{self.base_url}/api/chat",
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                for raw in resp:
                    if not raw.strip():
                        continue
                    try:
                        obj = json.loads(raw.decode("utf-8"))
                    except json.JSONDecodeError:
                        continue
                    chunk = obj.get("message", {}).get("content", "")
                    if chunk:
                        yield chunk
                    if obj.get("done"):
                        return
        except urllib.error.URLError as exc:
            raise RuntimeError(f"Ollama connection error: {exc}") from exc

    def is_available(self) -> bool:
        try:
            req = urllib.request.Request(f"{self.base_url}/api/tags", method="GET")
            with urllib.request.urlopen(req, timeout=5):
                return True
        except Exception:
            return False

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    def _chat(
        self,
        system: str,
        user: str,
        json_mode: bool,
        temperature: float,
        timeout: int,
    ) -> str:
        messages: List[Dict[str, str]] = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": user})

        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_ctx": self.num_ctx,
            },
        }
        if json_mode:
            payload["format"] = "json"

        resp = _post(f"{self.base_url}/api/chat", payload, timeout=timeout)

        # Ollama 0.6+: thinking is in a separate field; content is clean
        content = resp.get("message", {}).get("content", "")
        return _strip_think(content)
