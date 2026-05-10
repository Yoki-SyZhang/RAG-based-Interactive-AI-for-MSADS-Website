import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';

interface Citation {
  number: number;
  sourceId: string;
}

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  onCitationClick?: (sourceId: string) => void;
}

/**
 * remark plugin: split text nodes around `[N]` citation markers and emit
 * a custom node that lands as a `<cite data-index="N">[N]</cite>` element
 * in the rendered HTML, where the React component below makes it a
 * clickable superscript.
 */
function remarkCitations() {
  return (tree: unknown) => {
    visit(tree as never, 'text', (node: any, index, parent: any) => {
      if (typeof index !== 'number' || !parent) return;
      if (parent.type === 'citation') return;
      const value: string = node.value ?? '';
      if (!/\[\d+\]/.test(value)) return;

      const out: unknown[] = [];
      const regex = /\[(\d+)\]/g;
      let last = 0;
      let m: RegExpExecArray | null;
      while ((m = regex.exec(value)) !== null) {
        if (m.index > last) {
          out.push({ type: 'text', value: value.slice(last, m.index) });
        }
        out.push({
          type: 'citation',
          data: {
            hName: 'cite',
            hProperties: { 'data-index': m[1] },
          },
          children: [{ type: 'text', value: m[0] }],
        });
        last = m.index + m[0].length;
      }
      if (last < value.length) {
        out.push({ type: 'text', value: value.slice(last) });
      }

      parent.children.splice(index, 1, ...out);
      return index + out.length;
    });
  };
}

export default function ChatMessage({
  role,
  content,
  citations,
  onCitationClick,
}: ChatMessageProps) {
  if (role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%] bg-[#800000] text-white rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="m-0 whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%] bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-[rgba(0,0,0,0.05)]">
        <div className="text-[#1a1a1a] leading-relaxed text-sm sm:text-[15px] [&>:first-child]:mt-0 [&>:last-child]:mb-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkCitations]}
            components={{
              // citation marker → clickable superscript
              cite: ({ children, ...props }: any) => {
                const raw = props['data-index'] ?? props.dataIndex ?? '0';
                const idx = parseInt(String(raw), 10);
                const citation = citations?.find((c) => c.number === idx);
                return (
                  <sup
                    className={`text-[#800000] mx-0.5 not-italic ${
                      citation ? 'cursor-pointer hover:underline' : ''
                    }`}
                    onClick={citation ? () => onCitationClick?.(citation.sourceId) : undefined}
                  >
                    {children}
                  </sup>
                );
              },
              // tighten markdown defaults so messages don't sprout giant gaps
              p: ({ node, ...props }: any) => <p className="my-2" {...props} />,
              ul: ({ node, ...props }: any) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
              ol: ({ node, ...props }: any) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
              li: ({ node, ...props }: any) => <li className="leading-snug" {...props} />,
              h1: ({ node, ...props }: any) => <h1 className="text-lg font-semibold mt-3 mb-2" {...props} />,
              h2: ({ node, ...props }: any) => <h2 className="text-base font-semibold mt-3 mb-2" {...props} />,
              h3: ({ node, ...props }: any) => <h3 className="text-sm font-semibold mt-2 mb-1" {...props} />,
              strong: ({ node, ...props }: any) => <strong className="font-semibold" {...props} />,
              em: ({ node, ...props }: any) => <em className="italic" {...props} />,
              a: ({ node, ...props }: any) => (
                <a
                  className="text-[#800000] underline hover:no-underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
              code: ({ inline, className, children, ...props }: any) =>
                inline ? (
                  <code
                    className="bg-[#f5eeee] text-[#660000] px-1 py-0.5 rounded text-[0.9em] font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <pre className="bg-[#f5eeee] p-3 rounded text-xs overflow-x-auto my-2">
                    <code className={`font-mono ${className ?? ''}`} {...props}>
                      {children}
                    </code>
                  </pre>
                ),
              blockquote: ({ node, ...props }: any) => (
                <blockquote
                  className="border-l-2 border-[#800000] pl-3 my-2 text-[#555] italic"
                  {...props}
                />
              ),
              table: ({ node, ...props }: any) => (
                <div className="my-2 overflow-x-auto">
                  <table className="text-xs border-collapse w-full" {...props} />
                </div>
              ),
              th: ({ node, ...props }: any) => (
                <th className="border border-[rgba(128,0,0,0.2)] px-2 py-1 text-left bg-[#fafafa]" {...props} />
              ),
              td: ({ node, ...props }: any) => (
                <td className="border border-[rgba(128,0,0,0.1)] px-2 py-1 align-top" {...props} />
              ),
              hr: ({ node, ...props }: any) => (
                <hr className="my-3 border-[rgba(128,0,0,0.15)]" {...props} />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
