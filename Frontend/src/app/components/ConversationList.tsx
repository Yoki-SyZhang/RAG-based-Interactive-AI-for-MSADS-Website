import { MessageSquare } from 'lucide-react';

interface Conversation {
  id: string;
  preview: string;
  timestamp: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
  return (
    <div className="w-60 border-r border-[rgba(128,0,0,0.1)] bg-[#fafafa] h-full flex flex-col">
      <div className="p-4 border-b border-[rgba(128,0,0,0.1)]">
        <h3 className="m-0 p-0" style={{ fontFamily: "'Playfair Display', serif" }}>
          Conversations
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full text-left p-3 border-b border-[rgba(128,0,0,0.05)] hover:bg-[#f5eeee] transition-colors ${
              activeId === conv.id ? 'bg-[#f5eeee] border-l-2 border-l-[#800000]' : ''
            }`}
          >
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-[#800000] mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="m-0 text-sm text-[#1a1a1a] truncate">{conv.preview}</p>
                <p className="m-0 text-xs text-[#999] mt-1">{conv.timestamp}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
