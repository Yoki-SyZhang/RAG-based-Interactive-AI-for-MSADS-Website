import { MessageSquarePlus, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface ConversationSummary {
  id: string;
  title: string;
  createdAt: number;
}

interface ConversationListProps {
  conversations: ConversationSummary[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  onCreate,
}: ConversationListProps) {
  return (
    <div className="hidden md:flex w-56 lg:w-60 border-r border-[rgba(128,0,0,0.1)] bg-[#fafafa] h-full flex-col">
      <div className="p-3 border-b border-[rgba(128,0,0,0.1)] flex items-center justify-between gap-2">
        <h3
          className="m-0 p-0 truncate"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Conversations
        </h3>
        <button
          onClick={onCreate}
          className="p-1 rounded hover:bg-[#f5eeee] text-[#800000] transition-colors flex-shrink-0"
          aria-label="New conversation"
          title="New conversation"
        >
          <MessageSquarePlus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="text-xs text-[#999] text-center mt-4 px-3">
            No conversations yet.
          </p>
        ) : (
          conversations.map((conv) => (
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
                  <p className="m-0 text-sm text-[#1a1a1a] truncate">{conv.title}</p>
                  <p className="m-0 text-xs text-[#999] mt-1">
                    {formatDistanceToNow(new Date(conv.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
