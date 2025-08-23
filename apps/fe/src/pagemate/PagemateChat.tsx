import React, { useState, useCallback } from 'react';

import { ViewContainer } from './ViewContainer';
import { IntroView } from './views/IntroView';
import { ChatView, ChatMessage } from './views/ChatView';

interface PagemateChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PagemateChat: React.FC<PagemateChatProps> = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState<'intro' | 'chat'>('intro');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    
    setError(null);
    setLoading(true);

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: text.trim() },
    ];
    setMessages(nextMessages);
    
    // Switch to chat view if we're still in intro
    if (currentView === 'intro') {
      setCurrentView('chat');
    }

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, model: 'solar-pro2' }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Failed to fetch');

      const reply = data?.content ?? '';
      if (reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Failed to fetch response');
    } finally {
      setLoading(false);
    }
  }, [loading, messages, currentView]);

  const handleSwitchToChat = useCallback((initialMessage: string) => {
    sendMessage(initialMessage);
  }, [sendMessage]);

  return (
    <ViewContainer
      isOpen={isOpen}
      onClose={onClose}
      onSendMessage={sendMessage}
      loading={loading}
      showInput={true}
    >
      {currentView === 'intro' ? (
        <IntroView 
          onClose={onClose}
          onSendMessage={sendMessage}
          onSwitchToChat={handleSwitchToChat}
        />
      ) : (
        <ChatView 
          messages={messages}
          loading={loading}
          error={error}
        />
      )}
    </ViewContainer>
  );
};