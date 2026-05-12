import { useState } from 'react';
import Header from './components/Header';
import ConversationList, { type ConversationSummary } from './components/ConversationList';
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

interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  messages: Message[];
  sources: Source[];
}

function makeConversation(): Conversation {
  return {
    id: `c-${Date.now()}`,
    title: 'New conversation',
    createdAt: Date.now(),
    messages: [],
    sources: [],
  };
}

const truncateTitle = (s: string, max = 50) =>
  s.length > max ? `${s.slice(0, max).trim()}…` : s;

export default function App() {
  const initial = makeConversation();
  const [conversations, setConversations] = useState<Conversation[]>([initial]);
  const [activeId, setActiveId] = useState<string>(initial.id);
  const [highlightedSourceId, setHighlightedSourceId] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const active =
    conversations.find((c) => c.id === activeId) ?? conversations[0];
  const messages = active?.messages ?? [];
  const sources = active?.sources ?? [];

  const conversationSummaries: ConversationSummary[] = conversations.map((c) => ({
    id: c.id,
    title: c.title,
    createdAt: c.createdAt,
  }));

  const handleNewConversation = () => {
    const conv = makeConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
  };

  const handleSendMessage = async (content: string) => {
    if (isLoading) return;
    // Capture the conversation id at submit time. If the user switches
    // conversations mid-stream, replies must still land in the original one.
    const convId = activeId;

    const updateConv = (updater: (c: Conversation) => Conversation) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? updater(c) : c)),
      );
    };
    const setMsgs = (updater: (prev: Message[]) => Message[]) =>
      updateConv((c) => ({ ...c, messages: updater(c.messages) }));
    const setSrcs = (next: Source[]) =>
      updateConv((c) => ({ ...c, sources: next }));

    // History = prior turns of THIS conversation, captured before append.
    const conv = conversations.find((c) => c.id === convId);
    const history: ChatHistoryMessage[] = (conv?.messages ?? []).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Derive the conversation title from the first user message.
    if (conv && conv.messages.length === 0) {
      const title = truncateTitle(content);
      updateConv((c) => ({ ...c, title }));
    }

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
    };
    setMsgs((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const assistantId = `a-${Date.now()}`;
    let assistantCreated = false;

    const ensureAssistant = (initialContent: string, extra?: Partial<Message>) => {
      if (assistantCreated) {
        setMsgs((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, ...extra, content: initialContent } : m,
          ),
        );
        return;
      }
      assistantCreated = true;
      setIsLoading(false);
      setMsgs((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: initialContent, ...extra },
      ]);
    };

    try {
      await postChatStream(content, history, (event) => {
        console.log('[chat/stream]', event);
        if (event.type === 'token') {
          if (!assistantCreated) {
            assistantCreated = true;
            setIsLoading(false);
            setMsgs((prev) => [
              ...prev,
              { id: assistantId, role: 'assistant', content: event.delta },
            ]);
          } else {
            setMsgs((prev) =>
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
          setSrcs(newSources);

          const citations = event.citations.map((c) => ({
            number: c.index,
            sourceId: sourceIdFor(c.index),
          }));

          if (!assistantCreated) {
            assistantCreated = true;
            setIsLoading(false);
            setMsgs((prev) => [
              ...prev,
              { id: assistantId, role: 'assistant', content: event.answer, citations },
            ]);
          } else {
            setMsgs((prev) =>
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
        <ConversationList
          conversations={conversationSummaries}
          activeId={activeId}
          onSelect={setActiveId}
          onCreate={handleNewConversation}
        />

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
