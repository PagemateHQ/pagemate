import styled from '@emotion/styled';
import React, { useRef, useEffect, Fragment } from 'react';

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
<BubbleText>{renderMessageContent(m.content)}</BubbleText>

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

const BubbleText = styled.div`
  font-size: 14px;
  color: #0b3668;
  white-space: pre-wrap;
  display: flex;
  flex-direction: column;
  gap: 6px;
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

const CommandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px dashed rgba(0, 147, 246, 0.35);
  background: rgba(171, 220, 246, 0.16);
`;

const CommandVerb = styled.span`
  font-size: 11px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #074780;
  background: #e3f3ff;
  border: 1px solid rgba(0, 147, 246, 0.4);
  padding: 2px 6px;
  border-radius: 999px;
  white-space: nowrap;
`;

const CommandTarget = styled.code`
  font-size: 12px;
  color: #0b3668;
  white-space: pre-wrap;
`;

function renderMessageContent(content: string) {
  const lines = content.split(/\r?\n/);
  const out: React.ReactNode[] = [];
  const actionRe = /^(?:\s*)ACTION\s+([A-Z_]+)\s*[:\-]?\s*(.+)$/i;

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const m = line.match(actionRe);
    if (m) {
      const verb = (m[1] || '').toUpperCase();
      let target = (m[2] || '').trim();
      if (
        (target.startsWith('"') && target.endsWith('"')) ||
        (target.startsWith("'") && target.endsWith("'")) ||
        (target.startsWith('`') && target.endsWith('`'))
      ) {
        target = target.slice(1, -1);
      }
      out.push(
        <CommandRow key={`cmd-${idx}`}>
          <CommandVerb>{verb}</CommandVerb>
          <CommandTarget>{target}</CommandTarget>
        </CommandRow>
      );
    } else {
      out.push(<Fragment key={`ln-${idx}`}>{line}</Fragment>);
    }
  }

  return out;
}