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

export default function ChatMessage({ role, content, citations, onCitationClick }: ChatMessageProps) {
  const renderContentWithCitations = () => {
    if (!citations || citations.length === 0) {
      return content;
    }

    const parts = [];
    let lastIndex = 0;

    citations.forEach((citation, idx) => {
      const marker = `[${citation.number}]`;
      const markerIndex = content.indexOf(marker, lastIndex);

      if (markerIndex !== -1) {
        parts.push(content.substring(lastIndex, markerIndex));
        parts.push(
          <sup
            key={idx}
            className="text-[#800000] cursor-pointer hover:underline mx-0.5"
            onClick={() => onCitationClick?.(citation.sourceId)}
          >
            [{citation.number}]
          </sup>
        );
        lastIndex = markerIndex + marker.length;
      }
    });

    parts.push(content.substring(lastIndex));
    return parts;
  };

  if (role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%] bg-[#800000] text-white rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="m-0">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%] bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-[rgba(0,0,0,0.05)]">
        <p className="m-0 text-[#1a1a1a] leading-relaxed">{renderContentWithCitations()}</p>
      </div>
    </div>
  );
}
