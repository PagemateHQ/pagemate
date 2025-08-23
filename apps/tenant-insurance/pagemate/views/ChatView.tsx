import styled from '@emotion/styled';
import React, { Fragment, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

interface ChatViewProps {
  messages: ChatMessage[];
  loading?: boolean;
  error?: string | null;
  suppressActions?: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  loading = false,
  error = null,
  suppressActions = false,
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
              <BubbleText>
                {renderMessageContent(m.content, { isLast: i === messages.length - 1, suppress: suppressActions })}
              </BubbleText>
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
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const LoadingText = styled.span`
  width: 100%;
  padding: 0 8px;
  font-size: 12px;
  color: #6c8bab;
`;

const ErrorText = styled.span`
  width: 100%;
  padding: 0 8px;
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

const RagDetails = styled.details`
  border: 1px dashed rgba(0, 147, 246, 0.35);
  background: rgba(171, 220, 246, 0.16);
  border-radius: 8px;
  padding: 6px 8px;
`;

const RagSummary = styled.summary`
  cursor: pointer;
  list-style: none;
  font-size: 12px;
  color: #074780;
  background: #e3f3ff;
  border: 1px solid rgba(0, 147, 246, 0.4);
  padding: 4px 8px;
  border-radius: 999px;
  width: fit-content;
  margin-bottom: 6px;

  &::-webkit-details-marker {
    display: none;
  }
`;

const RagList = styled.ul`
  margin: 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const RagItem = styled.li`
  font-size: 13px;
  color: #0b3668;
`;

const MarkdownBlock = styled.div`
  color: #0b3668;
  font-size: 14px;
  line-height: 1.5;

  p { margin: 0 0 6px; }
  ul, ol { margin: 6px 0; padding-left: 20px; }
  li { margin: 2px 0; }
  a { color: #0b5cc1; text-decoration: underline; }
  code { background: #eef6ff; padding: 2px 4px; border-radius: 4px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
  pre { background: #082f4b; color: #e6f1fa; padding: 10px; border-radius: 6px; overflow: auto; }
  pre code { background: transparent; padding: 0; }
  h1, h2, h3, h4, h5, h6 { margin: 8px 0 6px; line-height: 1.2; }
  h1 { font-size: 18px; }
  h2 { font-size: 16px; }
  h3 { font-size: 15px; }
`;

function renderTextWithCommands(text: string, parseCommands: boolean) {
  if (!parseCommands) {
    return [
      <MarkdownBlock key={`md-all`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ node, ...props }) => (
              <a target="_blank" rel="noopener noreferrer" {...props} />
            ),
          }}
        >
          {text}
        </ReactMarkdown>
      </MarkdownBlock>,
    ];
  }
  const out: React.ReactNode[] = [];
  const re = /ACTION\s+([A-Z_]+)\s*[:\-]?\s*([\s\S]+?)(?=(?:\r?\n|\s*ACTION\s+[A-Z_]+|$))/gim;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let cmdIdx = 0;

  while ((match = re.exec(text)) !== null) {
    const start = match.index;
    const end = re.lastIndex;
    const before = text.slice(lastIndex, start);
    if (before) {
      out.push(
        <MarkdownBlock key={`md-${lastIndex}`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <a target="_blank" rel="noopener noreferrer" {...props} />
              ),
            }}
          >
            {before}
          </ReactMarkdown>
        </MarkdownBlock>,
      );
    }

    const verb = (match[1] || '').toUpperCase().trim();
    let target = (match[2] || '').trim();
    if (
      (target.startsWith('"') && target.endsWith('"')) ||
      (target.startsWith("'") && target.endsWith("'")) ||
      (target.startsWith('`') && target.endsWith('`'))
    ) {
      target = target.slice(1, -1);
    }

    out.push(
      <CommandRow key={`cmd-${cmdIdx++}`}>
        <CommandVerb>{verb}</CommandVerb>
        <CommandTarget>{target}</CommandTarget>
      </CommandRow>,
    );
    lastIndex = end;
  }

  const tail = text.slice(lastIndex);
  if (tail) {
    out.push(
      <MarkdownBlock key={`md-tail-${lastIndex}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ node, ...props }) => (
              <a target="_blank" rel="noopener noreferrer" {...props} />
            ),
          }}
        >
          {tail}
        </ReactMarkdown>
      </MarkdownBlock>,
    );
  }

  return out;
}

function renderMessageContent(
  content: string,
  opts?: { isLast?: boolean; suppress?: boolean },
) {
  const nodes: React.ReactNode[] = [];
  const ragRe = /RAG_BLOCK_START\s*(.*)\r?\n([\s\S]*?)\r?\nRAG_BLOCK_END/gm;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let ragIdx = 0;
  const parseCommands = !!opts?.isLast && !opts?.suppress;

  while ((m = ragRe.exec(content)) !== null) {
    const start = m.index;
    const end = ragRe.lastIndex;

    const before = content.slice(lastIndex, start);
    if (before) nodes.push(...renderTextWithCommands(before, parseCommands));

    const header = (m[1] || 'Retrieved results').trim();
    const body = (m[2] || '').trim();
    const items = body
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.startsWith('- '));

    nodes.push(
      <RagDetails key={`rag-${ragIdx++}`}>
        <RagSummary>🔎 {header}</RagSummary>
        {items.length > 0 && (
          <RagList>
            {items.map((line, i) => (
              <RagItem key={i}>{line.replace(/^\-\s*/, '')}</RagItem>
            ))}
          </RagList>
        )}
      </RagDetails>,
    );

    lastIndex = end;
  }

  const tail = content.slice(lastIndex);
  if (tail) nodes.push(...renderTextWithCommands(tail, parseCommands));

  return nodes.length ? nodes : content;
}
