import { useState } from 'react';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import SourcesPanel from './components/SourcesPanel';
import WelcomeScreen from './components/WelcomeScreen';
import ChatInput from './components/ChatInput';
import LoadingSkeleton from './components/LoadingSkeleton';
import { postChatStream, type ChatHistoryMessage } from './lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: { number: number; sourceId: string }[];
}

interface Source {
  id: string;
  title: string;
  text: string;
  page?: number;
  url?: string;
  relevanceScore: number;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [highlightedSourceId, setHighlightedSourceId] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    if (isLoading) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
    };

    // Snapshot prior messages BEFORE appending new user turn — this is the
    // multi-turn history the backend gets.
    const history: ChatHistoryMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const assistantId = `a-${Date.now()}`;
    let assistantCreated = false;

    const ensureAssistant = (initialContent: string, extra?: Partial<Message>) => {
      if (assistantCreated) {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, ...extra, content: initialContent } : m)),
        );
        return;
      }
      assistantCreated = true;
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: initialContent, ...extra },
      ]);
    };

    try {
      await postChatStream(content, history, (event) => {
        console.log('[chat/stream]', event);
        if (event.type === 'token') {
          if (!assistantCreated) {
            // First token arrived — replace the loading skeleton with a real bubble.
            assistantCreated = true;
            setIsLoading(false);
            setMessages((prev) => [
              ...prev,
              { id: assistantId, role: 'assistant', content: event.delta },
            ]);
          } else {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + event.delta } : m,
              ),
            );
          }
        } else if (event.type === 'done') {
          const sourceIdFor = (i: number) => `${assistantId}-s${i}`;
          const newSources: Source[] = event.citations.map((c, idx) => ({
            id: sourceIdFor(c.index),
            title: c.title,
            text: c.text,
            url: c.source_url,
            relevanceScore: Math.max(0.4, 1 - idx * 0.1),
          }));
          setSources(newSources);

          const citations = event.citations.map((c) => ({
            number: c.index,
            sourceId: sourceIdFor(c.index),
          }));

          if (!assistantCreated) {
            assistantCreated = true;
            setIsLoading(false);
            setMessages((prev) => [
              ...prev,
              { id: assistantId, role: 'assistant', content: event.answer, citations },
            ]);
          } else {
            // Use the authoritative full answer from the server in case any
            // delta got dropped, and attach citations.
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: event.answer, citations } : m,
              ),
            );
          }
        } else if (event.type === 'error') {
          ensureAssistant(`Error: ${event.message}`);
        }
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Unknown error';
      ensureAssistant(`Sorry, I couldn't reach the assistant. (${detail})`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = (question: string) => {
    void handleSendMessage(question);
  };

  const handleCitationClick = (sourceId: string) => {
    setHighlightedSourceId(sourceId);
    setTimeout(() => setHighlightedSourceId(undefined), 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-[#faf9f7]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {messages.length === 0 ? (
              <WelcomeScreen onQuestionClick={handleQuestionClick} />
            ) : (
              <div className="max-w-4xl mx-auto">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    citations={message.citations}
                    onCitationClick={handleCitationClick}
                  />
                ))}
                {isLoading && <LoadingSkeleton />}
              </div>
            )}
          </div>

          <ChatInput onSend={(msg) => void handleSendMessage(msg)} disabled={isLoading} />
        </div>

        <SourcesPanel sources={sources} highlightedId={highlightedSourceId} />
      </div>
    </div>
  );
}
