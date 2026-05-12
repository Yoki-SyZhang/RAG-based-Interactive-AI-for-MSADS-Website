import { Send } from 'lucide-react';
import { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-[rgba(128,0,0,0.1)] bg-white">
      <div className="flex items-center gap-3 max-w-4xl mx-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the ADS program..."
          disabled={disabled}
          className="flex-1 px-4 py-3 border border-[rgba(128,0,0,0.2)] rounded-full focus:outline-none focus:border-[#800000] focus:ring-2 focus:ring-[rgba(128,0,0,0.1)] disabled:opacity-50"
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="w-12 h-12 bg-[#800000] text-white rounded-full flex items-center justify-center hover:bg-[#660000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
