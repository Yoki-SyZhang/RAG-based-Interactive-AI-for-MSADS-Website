"""FastAPI server for the MSADS RAG agent.

Start:
    uvicorn app:app --host 0.0.0.0 --port 8000 --reload

POST /chat
    Body: {"query": "...", "history": [{"role": "user", "content": "..."}, ...]}
    Returns: {"answer": "...", "citations": [...], "debug": {...}}

POST /chat/stream
    Same body. Returns Server-Sent Events:
        data: {"type":"token","delta":"..."}\\n\\n
        data: {"type":"done","answer":"...","citations":[...],"debug":{...}}\\n\\n
"""

from __future__ import annotations

import json
import sys
import threading
from contextlib import asynccontextmanager
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, StreamingResponse
from pydantic import BaseModel

from agent import agent_loop, answer_generator, logger
from agent.ollama_client import OllamaClient
from agent.schemas import ChatResponse, Citation
from agent.tools import AgentTools

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


# ---------------------------------------------------------------------------
# Shared singletons (loaded once at startup)
# ---------------------------------------------------------------------------

_tools: AgentTools
_client: OllamaClient


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _tools, _client
    _tools = AgentTools(index_dir="index")
    _client = OllamaClient()
    print(f"[startup] Ollama available: {_client.is_available()}", flush=True)
    # Pre-warm the index by accessing it
    _ = _tools.loaded_index
    print("[startup] Index loaded.", flush=True)
    yield


app = FastAPI(title="MSADS RAG Agent", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response schemas (Pydantic, for FastAPI validation)
# ---------------------------------------------------------------------------

class HistoryMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    query: str
    history: List[HistoryMessage] = []


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/", include_in_schema=False)
async def root() -> RedirectResponse:
    return RedirectResponse(url="/docs")


@app.get("/health")
async def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "ollama_available": _client.is_available(),
        "model": _client.model,
    }


@app.post("/chat")
async def chat(request: ChatRequest) -> Dict[str, Any]:
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="query must not be empty")

    history = [{"role": m.role, "content": m.content} for m in request.history]

    memory = agent_loop.run(
        query=request.query,
        history=history,
        tools=_tools,
        client=_client,
    )

    response = answer_generator.generate(memory, _client)

    log_path = logger.write_log(memory, response)
    response.debug["log_path"] = str(log_path)

    return response.to_dict()


def _sse(payload: Dict[str, Any]) -> str:
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


@app.post("/chat/stream")
def chat_stream(request: ChatRequest) -> StreamingResponse:
    """SSE variant. Streams answer tokens as they arrive from the LLM.

    Sends a `:` keepalive comment every 5s during the agent loop so that
    proxies (e.g. cloudflared with a 100s read timeout) don't drop the
    connection while the agent is still doing tool calls.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="query must not be empty")

    history = [{"role": m.role, "content": m.content} for m in request.history]

    state: Dict[str, Any] = {"memory": None, "error": None, "done": False}

    def run_agent() -> None:
        try:
            state["memory"] = agent_loop.run(
                query=request.query,
                history=history,
                tools=_tools,
                client=_client,
            )
        except Exception as exc:
            state["error"] = f"agent_loop failed: {exc}"
        finally:
            state["done"] = True

    def event_stream():
        # First byte: ensures Cloudflare/proxies see headers immediately.
        yield ": connected\n\n"

        agent_thread = threading.Thread(target=run_agent, daemon=True)
        agent_thread.start()

        # Keepalive every 5s while the agent loop runs.
        while not state["done"]:
            agent_thread.join(timeout=5)
            if not state["done"]:
                yield ": ping\n\n"

        if state["error"]:
            yield _sse({"type": "error", "message": state["error"]})
            return

        memory = state["memory"]
        final_event: Dict[str, Any] = {}
        try:
            for ev in answer_generator.generate_stream(memory, _client):
                yield _sse(ev)
                if ev["type"] == "done":
                    final_event = ev
        except Exception as exc:
            yield _sse({"type": "error", "message": f"answer streaming failed: {exc}"})
            return

        # Persist run log after the response is fully generated.
        if final_event:
            try:
                resp = ChatResponse(
                    answer=final_event["answer"],
                    citations=[Citation(**c) for c in final_event["citations"]],
                    debug=final_event["debug"],
                )
                logger.write_log(memory, resp)
            except Exception:
                pass  # logging is best-effort

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
