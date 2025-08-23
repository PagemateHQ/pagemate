import styled from '@emotion/styled';
import React, { useRef, useEffect } from 'react';

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

interface ChatViewProps {
  messages: ChatMessage[];
  loading?: boolean;
  error?: string | null;
}

export const ChatView: React.FC<ChatViewProps> = ({ 
  messages,
  loading = false,
  error = null
}) => {
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      try {
        chatScrollRef.current?.scrollTo({
          top: chatScrollRef.current.scrollHeight,
          behavior: 'smooth',
        });
      } catch {}
    });
  }, [messages]);

  return (
    <ChatArea ref={chatScrollRef}>
      {messages.length === 0 ? (
        <EmptyState>Start the conversation below.</EmptyState>
      ) : (
        messages.map((m, i) => (
          <Bubble key={i} data-role={m.role}>
            <BubbleRole data-role={m.role}>{m.role === 'user' ? 'You' : 'Pagemate'}</BubbleRole>
            <BubbleText>{m.content}</BubbleText>
          </Bubble>
        ))
      )}
      {loading && <LoadingText>Thinking…</LoadingText>}
      {error && <ErrorText>{error}</ErrorText>}
    </ChatArea>
  );
};

const ChatArea = styled.div`
  width: 100%;
  max-width: 407px;
  margin: 8px auto 0;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 80px; /* Space for the input bar */
`;

const Bubble = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 147, 246, 0.16);
  background: rgba(171, 220, 246, 0.2);
  &[data-role='user'] {
    background: rgba(171, 220, 246, 0.31);
  }
`;

const BubbleRole = styled.span`
  font-size: 12px;
  color: #6c8bab;
`;

const BubbleText = styled.span`
  font-size: 14px;
  color: #0b3668;
  white-space: pre-wrap;
`;

const LoadingText = styled.span`
  font-size: 12px;
  color: #6c8bab;
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: #c0392b;
`;

const EmptyState = styled.span`
  font-size: 12px;
  color: #6c8bab;
  text-align: center;
`;