# Colab Demo Deployment

The default deployment for this project is **fully local** (see the root `README.md`).
This directory provides a **secondary, demo-only path**: run the FastAPI backend on
Google Colab and connect a local frontend to it. Use this when your laptop cannot
host `qwen3:8b` (≈ 5–6 GB resident memory).

Architecture during a demo:

```
[ Browser ] → [ Local Vite dev server (5173) ]
                       │  proxy /api/*
                       ▼
              [ Cloudflare quick tunnel ]
                       │  HTTPS
                       ▼
              [ Colab → uvicorn :8000 ]
                       │  HTTP
                       ▼
                 [ Ollama :11434 (qwen3:8b) ]
```

## One-time prep

1. Push this repo to a GitHub remote that Colab can reach (it is already on
   `github.com/Yoki-SyZhang/RAG-based-Interactive-AI-for-MSADS-Website`).
2. Confirm `index/` is tracked in git — Colab pulls it on `git clone` instead of
   needing a Drive mount. (The whole index is ~6 MB.)

## Running a demo

1. Open `colab/run_backend.ipynb` in Colab. Easiest way: prefix the file URL on
   GitHub with `https://colab.research.google.com/github/`. For this repo:

       https://colab.research.google.com/github/Yoki-SyZhang/RAG-based-Interactive-AI-for-MSADS-Website/blob/main/colab/run_backend.ipynb

2. *Runtime → Change runtime type → T4 GPU* (CPU works but each chat turn takes
   minutes).
3. Run cells 1–3 in order. First run ≈ 5–10 min (mostly the `qwen3:8b` download).
4. The end of cell 3 prints a line like:

       Public backend URL : https://random-three-words.trycloudflare.com

5. On your laptop, start the frontend pointed at that URL:

       cd Frontend
       VITE_BACKEND_URL=https://random-three-words.trycloudflare.com npm run dev

6. Open http://localhost:5173 and chat. The Vite dev server proxies `/api/*` to
   the Colab tunnel — the browser only ever talks to `localhost:5173`, so there
   is no CORS or mixed-content issue.

## Stopping / restarting

- **Stop the demo:** in Colab, *Runtime → Disconnect and delete runtime*. The
  public URL stops working immediately.
- **Restart after a session dies:** re-run all cells. You will get a **new**
  public URL each time (Cloudflare quick tunnels are ephemeral). Update the
  `VITE_BACKEND_URL` in the frontend command and restart `npm run dev`.

## Why these tools

- **Cloudflare quick tunnel** — no signup, no auth token, just `cloudflared
  tunnel --url http://localhost:8000`. Compare to ngrok which needs a free
  account + token.
- **Plain HTTP backend** — the tunnel terminates HTTPS at Cloudflare's edge, so
  the FastAPI side stays HTTP. The Vite dev proxy hides the public URL from the
  browser, avoiding mixed-content blocking.
- **No Drive mount** — `index/` is small enough to live in git, so a fresh
  Colab session is fully bootstrapped from `git clone`.

## Limits to be aware of

| Limit | Impact |
|---|---|
| Free Colab idle timeout (~90 min) | Tunnel and uvicorn die; frontend gets connection errors. Re-run cell 3. |
| Free Colab max session (12 h) | Same as above; plus the `qwen3:8b` download repeats unless you cache it to Drive. |
| Cloudflare quick-tunnel URL is random per run | Every restart needs a new `VITE_BACKEND_URL` on the frontend. |
| Single `uvicorn` worker | Concurrent chat requests serialize. Fine for a demo; not for real load. |

If you need a stable URL across sessions, switch to a named Cloudflare tunnel
(requires a Cloudflare account + domain) or pay for ngrok — but for a demo,
the quick tunnel is enough.
