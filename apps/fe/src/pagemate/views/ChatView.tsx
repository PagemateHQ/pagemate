import styled from '@emotion/styled';
import React, { useEffect, useRef } from 'react';

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
  error = null,
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
          <BubbleWrapper key={i}>
            <Bubble data-role={m.role}>
              <BubbleRole data-role={m.role}>
                {m.role === 'user' ? 'You' : 'Pagemate'}
              </BubbleRole>
              <BubbleText>{m.content}</BubbleText>
            </Bubble>
          </BubbleWrapper>
        ))
      )}
      {loading && <LoadingText>Thinking…</LoadingText>}
      {error && <ErrorText>{error}</ErrorText>}
    </ChatArea>
  );
};

const ChatArea = styled.div`
  margin-top: 8px;
  width: 100%;

  flex: 1;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 80px; /* Space for the input bar */
`;

const BubbleWrapper = styled.div`
  padding: 0 8px;
  width: 100%;
  display: flex;
`;
const Bubble = styled.div`
  width: 100%;
  padding: 10px 12px;

  display: flex;
  flex-direction: column;
  gap: 4px;

  border-radius: 8px;
  border: 1px solid rgba(0, 147, 246, 0.16);
  background: rgba(171, 220, 246, 0.2);

  &[data-role='user'] {
    margin-left: auto;
    width: fit-content;
    max-width: 80%;
    border: 1px solid #bae3f8;
    background: #fff;
  }

  &[data-role='assistant'] {
    width: fit-content;
    max-width: 80%;
    border: 1px solid #bae3f8;
    background: #dff4ff;
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
