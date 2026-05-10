import { FileText, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Source {
  id: string;
  title: string;
  snippet: string;
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

  if (isCollapsed) {
    return (
      <div className="w-12 border-l border-[rgba(128,0,0,0.1)] bg-white flex flex-col">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-3 hover:bg-[#f5eeee] transition-colors"
          aria-label="Expand sources panel"
        >
          <ChevronRight className="w-5 h-5 text-[#800000] rotate-180" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-[rgba(128,0,0,0.1)] bg-white h-full flex flex-col">
      <div className="p-4 border-b border-[rgba(128,0,0,0.1)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="m-0 p-0" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sources
          </h3>
          {sources.length > 0 && (
            <span className="bg-[#800000] text-white text-xs px-2 py-0.5 rounded-full">
              {sources.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 hover:bg-[#f5eeee] rounded transition-colors"
          aria-label="Collapse sources panel"
        >
          <ChevronRight className="w-4 h-4 text-[#800000]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sources.map((source) => (
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
              <h4 className="m-0 text-sm flex-1">{source.title}</h4>
            </div>

            <p className="text-xs text-[#666] m-0 mb-2 line-clamp-2">
              {source.snippet}
            </p>

            <div className="flex items-center justify-between text-xs text-[#999]">
              <span>{source.page ? `Page ${source.page}` : source.url}</span>
            </div>

            <div className="mt-2">
              <div className="h-1 bg-[#f5eeee] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#800000] rounded-full"
                  style={{ width: `${source.relevanceScore * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
