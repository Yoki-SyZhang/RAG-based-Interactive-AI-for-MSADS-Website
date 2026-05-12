import { FileText, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';

interface Source {
  id: string;
  title: string;
  text: string;
  page?: number;
  url?: string;
  relevanceScore: number;
}

interface SourcesPanelProps {
  sources: Source[];
  highlightedId?: string;
}

export default function SourcesPanel({ sources, highlightedId }: SourcesPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const header = (
    <div className="p-3 sm:p-4 border-b border-[rgba(128,0,0,0.1)] flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <h3 className="m-0 p-0 truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
          Sources
        </h3>
        {sources.length > 0 && (
          <span className="bg-[#800000] text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
            {sources.length}
          </span>
        )}
      </div>
      <button
        onClick={() => setIsCollapsed(true)}
        className="p-1 hover:bg-[#f5eeee] rounded transition-colors flex-shrink-0"
        aria-label="Close sources panel"
      >
        <X className="w-4 h-4 text-[#800000] md:hidden" />
        <ChevronRight className="w-4 h-4 text-[#800000] hidden md:block" />
      </button>
    </div>
  );

  const cards = (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
      {sources.length === 0 ? (
        <p className="text-xs text-[#999] text-center mt-4">
          Sources will appear here after you ask a question.
        </p>
      ) : (
        sources.map((source) => (
          <div
            key={source.id}
            className={`border rounded-lg p-3 transition-all ${
              highlightedId === source.id
                ? 'border-l-4 border-l-[#800000] bg-[#f5eeee]'
                : 'border-[rgba(0,0,0,0.1)] hover:border-[#800000] hover:bg-[#fafafa]'
            }`}
          >
            <div className="flex items-start gap-2 mb-2">
              <FileText className="w-4 h-4 text-[#800000] mt-0.5 flex-shrink-0" />
              <h4 className="m-0 text-sm flex-1 break-words">{source.title}</h4>
            </div>

            <div className="text-xs text-[#666] mb-2 whitespace-pre-wrap break-words max-h-40 overflow-y-auto pr-1">
              {source.text}
            </div>

            {source.url && (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-[#999] truncate hover:text-[#800000] hover:underline"
                title={source.url}
              >
                {source.url}
              </a>
            )}

            <div className="mt-2 h-1 bg-[#f5eeee] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#800000] rounded-full"
                style={{ width: `${source.relevanceScore * 100}%` }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );

  // Collapsed: a small strip on desktop, a floating FAB on mobile.
  if (isCollapsed) {
    return (
      <>
        <div className="hidden md:flex w-12 border-l border-[rgba(128,0,0,0.1)] bg-white flex-col">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-3 hover:bg-[#f5eeee] transition-colors"
            aria-label="Expand sources panel"
          >
            <ChevronRight className="w-5 h-5 text-[#800000] rotate-180" />
          </button>
        </div>
        {sources.length > 0 && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="md:hidden fixed bottom-20 right-4 z-30 w-12 h-12 rounded-full bg-[#800000] text-white shadow-lg flex items-center justify-center hover:bg-[#660000] transition-colors"
            aria-label="Open sources panel"
          >
            <FileText className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-white text-[#800000] text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center border border-[#800000]">
              {sources.length}
            </span>
          </button>
        )}
      </>
    );
  }

  // Expanded: inline column on md+, full-screen overlay on smaller widths.
  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={() => setIsCollapsed(true)}
        className="md:hidden fixed inset-0 z-40 bg-black/30"
        aria-hidden="true"
      />
      <aside
        className="
          flex flex-col bg-white border-l border-[rgba(128,0,0,0.1)]
          fixed inset-y-0 right-0 z-50 w-[85vw] max-w-sm shadow-2xl
          md:relative md:inset-auto md:z-auto md:w-72 md:shadow-none
          lg:w-80 xl:w-96
        "
      >
        {header}
        {cards}
      </aside>
    </>
  );
}
