const API_BASE = '/api';

export interface BackendCitation {
  index: number;
  title: string;
  source_url: string;
  snippet: string;
}

export interface BackendChatResponse {
  answer: string;
  citations: BackendCitation[];
  debug: Record<string, unknown>;
}

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface HealthResponse {
  status: string;
  ollama_available: boolean;
  model: string;
}

export type StreamEvent =
  | { type: 'token'; delta: string }
  | {
      type: 'done';
      answer: string;
      citations: BackendCitation[];
      debug: Record<string, unknown>;
    }
  | { type: 'error'; message: string };

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body && typeof body.detail === 'string') return body.detail;
  } catch {
    // body wasn't JSON; fall through
  }
  return `${res.status} ${res.statusText}`;
}

export async function postChat(
  query: string,
  history: ChatHistoryMessage[],
  signal?: AbortSignal,
): Promise<BackendChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, history }),
    signal,
  });
  if (!res.ok) {
    throw new Error(await readError(res));
  }
  return res.json();
}

export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`, { signal });
  if (!res.ok) {
    throw new Error(await readError(res));
  }
  return res.json();
}

/**
 * POST /chat/stream and parse the SSE response. The callback is invoked once
 * per server event; resolves when the stream closes.
 *
 * SSE protocol (from the backend):
 *   - Lines starting with `:` are comments / keepalives — ignored.
 *   - `data: <json>\n\n` carries one JSON-encoded `StreamEvent`.
 */
export async function postChatStream(
  query: string,
  history: ChatHistoryMessage[],
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, history }),
    signal,
  });
  if (!res.ok || !res.body) {
    throw new Error(await readError(res));
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Drain complete events. SSE separates them with a blank line (\n\n).
    let sep: number;
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);

      const dataPayloads: string[] = [];
      for (const line of block.split('\n')) {
        if (line.startsWith('data: ')) {
          dataPayloads.push(line.slice(6));
        }
        // Lines starting with `:` are comments; everything else is also ignored.
      }
      if (dataPayloads.length === 0) continue;

      try {
        const parsed = JSON.parse(dataPayloads.join('\n')) as StreamEvent;
        onEvent(parsed);
      } catch {
        // Malformed event — skip it rather than killing the whole stream.
      }
    }
  }
}
