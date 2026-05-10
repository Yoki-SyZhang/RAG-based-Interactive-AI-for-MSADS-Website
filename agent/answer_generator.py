"""Generate the final answer from evidence and build citations."""

from __future__ import annotations

import re
from typing import Any, Dict, Iterator, List

from agent.ollama_client import OllamaClient
from agent.prompts import ANSWER_GENERATION_SYSTEM, answer_generation_user
from agent.schemas import AgentMemory, ChatResponse, Citation


def _build_evidence_dicts(memory: AgentMemory) -> List[Dict[str, Any]]:
    return [ev.to_dict() for ev in memory.evidence_container]


def _extract_citation_indices(answer_text: str) -> List[int]:
    """Extract all [n] citation markers from answer text."""
    return [int(m) for m in re.findall(r"\[(\d+)\]", answer_text)]


def _citation_text(ev: Dict[str, Any]) -> str:
    """Full text shown in the UI for this citation.

    For chunk evidence we surface the complete chunk so the frontend can
    show the user the exact passage the answer relied on. For
    `node_structure` evidence (a KG tree dump produced by `inspect_page`)
    we substitute a short placeholder — the raw markdown is meaningless
    to end users.
    """
    if ev.get("source_type") == "node_structure":
        title = ev.get("page_title") or "page"
        return f"(Structural overview of {title})"
    return (ev.get("text") or "").strip()


def _build_citations(answer_text: str, evidence_list: List[Dict[str, Any]]) -> List[Citation]:
    """Build citation objects from evidence items referenced in the answer."""
    indices = sorted(set(_extract_citation_indices(answer_text)))
    # Map evidence_id ev_001 -> index 1
    id_to_ev: Dict[int, Dict[str, Any]] = {}
    for ev in evidence_list:
        eid = ev.get("evidence_id", "")
        m = re.match(r"ev_(\d+)", eid)
        if m:
            id_to_ev[int(m.group(1))] = ev

    citations = []
    for idx in indices:
        ev = id_to_ev.get(idx)
        if not ev:
            continue
        citations.append(
            Citation(
                index=idx,
                title=ev.get("page_title", ""),
                source_url=ev.get("source_url", ""),
                text=_citation_text(ev),
            )
        )
    return citations


def _build_debug(memory: AgentMemory) -> Dict[str, Any]:
    return {
        "run_id": memory.run_id,
        "log_path": "",
        "rewritten_queries": [r.get("query", "") for r in memory.rewritten_queries],
        "tool_call_count": len(memory.tool_calls),
        "stop_reason": memory.stop_reason,
    }


def generate_stream(memory: AgentMemory, client: OllamaClient) -> Iterator[Dict[str, Any]]:
    """Stream answer generation. Yields events:
        {"type": "token", "delta": "..."}
        {"type": "done", "answer": "...", "citations": [...], "debug": {...}}
    """
    evidence_list = _build_evidence_dicts(memory)
    user_msg = answer_generation_user(
        original_query=memory.original_query,
        evidence_container=evidence_list,
        stop_reason=memory.stop_reason,
    )

    parts: List[str] = []
    try:
        for chunk in client.chat_text_stream(ANSWER_GENERATION_SYSTEM, user_msg):
            parts.append(chunk)
            yield {"type": "token", "delta": chunk}
    except Exception as exc:
        fail_chunk = f"(answer generation failed: {exc})"
        parts.append(fail_chunk)
        yield {"type": "token", "delta": fail_chunk}

    answer_text = "".join(parts)
    citations = _build_citations(answer_text, evidence_list)
    debug = _build_debug(memory)

    yield {
        "type": "done",
        "answer": answer_text,
        "citations": [
            {
                "index": c.index,
                "title": c.title,
                "source_url": c.source_url,
                "text": c.text,
            }
            for c in citations
        ],
        "debug": debug,
    }


def generate(memory: AgentMemory, client: OllamaClient) -> ChatResponse:
    """Non-streaming wrapper kept for backward-compat callers (e.g., POST /chat)."""
    answer_text = ""
    citations: List[Citation] = []
    debug: Dict[str, Any] = {}
    for ev in generate_stream(memory, client):
        if ev["type"] == "done":
            answer_text = ev["answer"]
            citations = [Citation(**c) for c in ev["citations"]]
            debug = ev["debug"]
    return ChatResponse(answer=answer_text, citations=citations, debug=debug)
