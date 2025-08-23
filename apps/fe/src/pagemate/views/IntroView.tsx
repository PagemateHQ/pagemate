import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import React, { useCallback, useRef, useState } from 'react';

import { SparkleIcon } from '@/components/icons/SparkleIcon';

interface IntroViewProps {
  onClose?: () => void;
}

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export const IntroView: React.FC<IntroViewProps> = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      try {
        chatScrollRef.current?.scrollTo({
          top: chatScrollRef.current.scrollHeight,
          behavior: 'smooth',
        });
      } catch {}
    });
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;
      setError(null);
      setLoading(true);

      const nextMessages: ChatMessage[] = [
        ...messages,
        { role: 'user', content: text.trim() },
      ];
      setMessages(nextMessages);
      setInput('');
      scrollToBottom();

      try {
        // Tool calling (local): check if user asked to click/highlight by text
        const tool = parseToolIntent(text);
        if (tool) {
          const ok = executeTool(tool);
          const verb = tool.type === 'highlightByText' ? 'Highlighted' : 'Clicked';
          const assistantText = ok
            ? `✅ ${verb} "${'text' in tool ? tool.text : ''}"`
            : `⚠️ Couldn't find target for "${'text' in tool ? tool.text : ''}"`;
          setMessages((prev) => [...prev, { role: 'assistant', content: assistantText }]);
          scrollToBottom();
          return; // Skip network call when a local tool is executed
        }

        const resp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: nextMessages, model: 'solar-pro2' }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.error || 'Failed to fetch');

        const reply = data?.content ?? '';
        if (reply) {
          setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
          // Parse any ACTION directives in the assistant reply and execute tools.
          try {
            const actions = parseAssistantActions(reply);
            actions.forEach((a) => executeTool(a));
          } catch {}
          scrollToBottom();
        }
      } catch (e: any) {
        console.error(e);
        setError(e?.message || 'Failed to fetch response');
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, scrollToBottom]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (input.trim()) {
        sendMessage(input);
      }
    },
    [input, sendMessage]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0.0, 0.2, 1] as [number, number, number, number],
      },
    },
  };

  type ToolAction =
    | { type: 'clickByText'; text: string }
    | { type: 'highlightByText'; text: string };

  const parseToolIntent = (raw: string): ToolAction | null => {
    const text = raw.trim();
    // Match: highlight ...
    const h1 = text.match(/highlight\s+["']([^"']+)["']/i);
    if (h1) return { type: 'highlightByText', text: h1[1] };
    const h2 = text.match(/highlight\s+(.+?)\s+(?:button|link|field)?$/i);
    if (h2) return { type: 'highlightByText', text: h2[1] };

    // Match: click button with text '...'
    const re1 = /click\s+(?:the\s+)?button\s+with\s+text\s+["']([^"']+)["']/i;
    const m1 = text.match(re1);
    if (m1) return { type: 'clickByText', text: m1[1] };

    // Match: click '...'
    const re2 = /click\s+["']([^"']+)["']/i;
    const m2 = text.match(re2);
    if (m2) return { type: 'clickByText', text: m2[1] };

    // Match: click ... button
    const re3 = /click\s+(.+?)\s+button/i;
    const m3 = text.match(re3);
    if (m3) return { type: 'clickByText', text: m3[1] };

    return null;
  };

  const executeTool = (tool: ToolAction): boolean => {
    switch (tool.type) {
      case 'clickByText': {
        const el = findClickableByText(tool.text);
        if (!el) return false;
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          flashHighlight(el);
          (el as HTMLElement).click();
          return true;
        } catch {
          return false;
        }
      }
      case 'highlightByText': {
        const el = findClickableByText(tool.text);
        if (!el) return false;
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          showSpotlight(el);
          return true;
        } catch {
          return false;
        }
      }
      default:
        return false;
    }
  };

  const parseAssistantActions = (text: string): ToolAction[] => {
    const actions: ToolAction[] = [];
    // Match patterns like:
    // ACTION SPOTLIGHT Start Building
    // ACTION CLICK "Start Building"
    const re = /ACTION\s+([A-Z_]+)\s*[:\-]?\s*["'“]?([^"'”\n]+)["'”]?/gim;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const verb = (m[1] || '').toUpperCase().trim();
      const target = (m[2] || '').trim();
      if (!target) continue;
      if (verb === 'SPOTLIGHT') actions.push({ type: 'highlightByText', text: target });
      else if (verb === 'CLICK') actions.push({ type: 'clickByText', text: target });
    }
    return actions;
  };

  const findClickableByText = (targetText: string): HTMLElement | null => {
    const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
    const t = norm(targetText);
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>(
        'button, [role="button"], a, input[type="button"], input[type="submit"]'
      )
    );
    const visible = candidates.filter((el) => isVisible(el));
    // Prefer exact match, then includes
    const exact = visible.find((el) => norm(el.textContent || el.getAttribute('aria-label') || '') === t);
    if (exact) return exact;
    const partial = visible.find((el) => norm(el.textContent || el.getAttribute('aria-label') || '').includes(t));
    return partial || null;
  };

  const isVisible = (el: HTMLElement): boolean => {
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      rect.width > 0 &&
      rect.height > 0
    );
  };

  const flashHighlight = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const highlight = document.createElement('div');
    Object.assign(highlight.style, {
      position: 'fixed',
      left: `${rect.left - 6}px`,
      top: `${rect.top - 6}px`,
      width: `${rect.width + 12}px`,
      height: `${rect.height + 12}px`,
      borderRadius: '8px',
      boxShadow: '0 0 0 3px rgba(0,147,246,0.9), 0 0 16px rgba(0,147,246,0.6)',
      pointerEvents: 'none',
      transition: 'opacity 400ms ease',
      opacity: '1',
      zIndex: '2147483647',
    } as CSSStyleDeclaration);
    document.body.appendChild(highlight);
    setTimeout(() => {
      highlight.style.opacity = '0';
      setTimeout(() => highlight.remove(), 450);
    }, 600);
  };

  // Persistent spotlight that pulses indefinitely until replaced/removed
  let activeSpotlightOverlay: HTMLDivElement | null = null;
  let activeSpotlightTarget: HTMLElement | null = null;
  let spotlightInterval: ReturnType<typeof setInterval> | null = null;

  const ensureSpotlightStyles = () => {
    if (document.getElementById('pagemate-spotlight-styles')) return;
    const style = document.createElement('style');
    style.id = 'pagemate-spotlight-styles';
    style.textContent = `
      @keyframes pagemate-pulse {
        0%, 100% { box-shadow: 0 0 0 2px rgba(0,147,246,0.85), 0 0 16px rgba(0,147,246,0.55); }
        50% { box-shadow: 0 0 0 4px rgba(0,147,246,1), 0 0 28px rgba(0,147,246,0.8); }
      }
      .pagemate-spotlight-overlay {
        animation: pagemate-pulse 1.6s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
  };

  const positionSpotlight = () => {
    if (!activeSpotlightOverlay || !activeSpotlightTarget) return;
    const rect = activeSpotlightTarget.getBoundingClientRect();
    const radius = window.getComputedStyle(activeSpotlightTarget).borderRadius || '8px';
    Object.assign(activeSpotlightOverlay.style, {
      left: `${rect.left - 6}px`,
      top: `${rect.top - 6}px`,
      width: `${rect.width + 12}px`,
      height: `${rect.height + 12}px`,
      borderRadius: radius,
    } as CSSStyleDeclaration);
  };

  const removeSpotlight = () => {
    if (spotlightInterval) {
      clearInterval(spotlightInterval);
      spotlightInterval = null;
    }
    if (activeSpotlightOverlay) {
      activeSpotlightOverlay.remove();
      activeSpotlightOverlay = null;
    }
    activeSpotlightTarget = null;
    window.removeEventListener('scroll', positionSpotlight, true);
    window.removeEventListener('resize', positionSpotlight);
  };

  const showSpotlight = (el: HTMLElement) => {
    ensureSpotlightStyles();
    removeSpotlight();
    activeSpotlightTarget = el;

    const overlay = document.createElement('div');
    overlay.className = 'pagemate-spotlight-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      left: '0px',
      top: '0px',
      width: '0px',
      height: '0px',
      borderRadius: '8px',
      pointerEvents: 'none',
      zIndex: '2147483647',
    } as CSSStyleDeclaration);
    document.body.appendChild(overlay);
    activeSpotlightOverlay = overlay as HTMLDivElement;
    positionSpotlight();

    // Keep aligned on scroll/resize and periodically in case of layout changes
    window.addEventListener('scroll', positionSpotlight, true);
    window.addEventListener('resize', positionSpotlight);
    spotlightInterval = setInterval(positionSpotlight, 300);
  };

  return (
    <MotionContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <CircleGlow />

      <Content>
        <LogoSection>
          <LogoWrapper>
            <LogoBlur />
            <Logo />
            <LogoOverlay>
              <div className="blur-layer" />
              <div className="blur-layer" />
              <div className="blur-layer" />
              <div className="blur-layer" />
              <div className="blur-layer" />
              <div className="blur-layer" />
              <div className="blur-layer" />
              <div className="blur-layer" />
              <div className="blur-layer" />
              <div className="blur-layer" />
              <div className="blur-layer" />
              <div className="blur-layer" />
            </LogoOverlay>
          </LogoWrapper>
          <MotionTextContent variants={itemVariants}>
            <Title>
              Pagemate is here
              <br />
              to guide you
            </Title>
            <Subtitle>
              <HighlightedText>
                Hi, I'm Pagemate, your own AI Agent!
              </HighlightedText>
              <br />
              Ask me anything about the product,
              <br />
              such as but not limited to:
            </Subtitle>
          </MotionTextContent>
        </LogoSection>

        <MotionSuggestionsContainer variants={itemVariants}>
          <MotionSuggestionButton
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(171, 220, 246, 0.45)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setInput('Help me find a specific transaction')}
          >
            Help me find a specific transaction
          </MotionSuggestionButton>
          <MotionSuggestionButton
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(171, 220, 246, 0.45)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setInput('How can I transfer money between accounts?')}
          >
            How can I transfer money between accounts?
          </MotionSuggestionButton>
          <MotionSuggestionButton
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(171, 220, 246, 0.45)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setInput('How do I deposit a check?')}
          >
            How do I deposit a check?
          </MotionSuggestionButton>
        </MotionSuggestionsContainer>

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

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <MotionInputContainer variants={itemVariants}>
            <InputIcon>
              <SparkleIcon />
            </InputIcon>
            <InputContent>
              <InputField
                placeholder="Ask anything about your product…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!loading) handleSubmit(e as unknown as React.FormEvent);
                  }
                }}
                disabled={loading}
              />
              <InputLabel>{loading ? 'Generating…' : 'Turbo Mode'}</InputLabel>
            </InputContent>
            <SendButton type="submit" disabled={!input.trim() || loading}>
              {loading ? '…' : 'Send'}
            </SendButton>
          </MotionInputContainer>
        </form>
      </Content>

      <BottomBlurImage src="/assets/intro-bottom-blur.png" alt="" />
    </MotionContainer>
  );
};

const _Container = styled.div`
  position: relative;
  width: 471px;
  height: 577px;
  overflow: hidden;

  border-radius: 12px;
  border: 1px solid #abdcf6;
  background:
    linear-gradient(
      0deg,
      rgba(236, 250, 255, 0.33) 0%,
      rgba(236, 250, 255, 0.33) 100%
    ),
    rgba(234, 249, 255, 0.6);
  box-shadow: 0 10px 32px 0 rgba(106, 219, 255, 0.3);

  /* TODO: if hardware acceleration is enabled, make backdrop filter to blur(8px) */
  backdrop-filter: blur(4px);
`;
const MotionContainer = motion(_Container);

const CircleGlow = styled.div`
  position: absolute;
  width: 403px;
  height: 359px;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background: url('/assets/intro-circle.svg');
  background-size: cover;
  background-position: top center;
  background-repeat: no-repeat;
`;

const Content = styled.div`
  padding: 16px 8px 8px;
  height: 100%;

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LogoSection = styled.div`
  padding-top: 32px;
  padding-bottom: 64px;

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 407px;
`;

const LogoWrapper = styled.div`
  position: relative;
  width: 180px;
  height: 180px;
  margin-bottom: -64px;
`;

const LogoBlur = styled.div`
  position: absolute;
  width: 180px;
  height: 180px;
  left: 0;
  top: 0;
  background: url('/assets/logo.png') center/cover no-repeat;
  filter: blur(19.5px);
  opacity: 0.47;
`;

const Logo = styled.div`
  position: absolute;
  width: 155px;
  height: 155px;
  left: 12.4px;
  top: 0;
  background: url('/assets/logo.png') center/cover no-repeat;
`;

const LogoOverlay = styled.div`
  position: absolute;
  width: 180px;
  height: 180px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;

  .blur-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 180px;
    height: 180px;
    background: rgba(255, 255, 255, 0.01);
  }

  .blur-layer:nth-of-type(1) {
    backdrop-filter: blur(0.67px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 40%,
      rgba(0, 0, 0, 1) 42%,
      rgba(0, 0, 0, 1) 45%,
      rgba(0, 0, 0, 0) 47%
    );
  }

  .blur-layer:nth-of-type(2) {
    backdrop-filter: blur(1.33px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 44%,
      rgba(0, 0, 0, 1) 46%,
      rgba(0, 0, 0, 1) 49%,
      rgba(0, 0, 0, 0) 51%
    );
  }

  .blur-layer:nth-of-type(3) {
    backdrop-filter: blur(2px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 48%,
      rgba(0, 0, 0, 1) 50%,
      rgba(0, 0, 0, 1) 53%,
      rgba(0, 0, 0, 0) 55%
    );
  }

  .blur-layer:nth-of-type(4) {
    backdrop-filter: blur(2.67px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 52%,
      rgba(0, 0, 0, 1) 54%,
      rgba(0, 0, 0, 1) 57%,
      rgba(0, 0, 0, 0) 59%
    );
  }

  .blur-layer:nth-of-type(5) {
    backdrop-filter: blur(3.33px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 56%,
      rgba(0, 0, 0, 1) 58%,
      rgba(0, 0, 0, 1) 61%,
      rgba(0, 0, 0, 0) 63%
    );
  }

  .blur-layer:nth-of-type(6) {
    backdrop-filter: blur(4px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 60%,
      rgba(0, 0, 0, 1) 62%,
      rgba(0, 0, 0, 1) 65%,
      rgba(0, 0, 0, 0) 67%
    );
  }

  .blur-layer:nth-of-type(7) {
    backdrop-filter: blur(4.67px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 64%,
      rgba(0, 0, 0, 1) 66%,
      rgba(0, 0, 0, 1) 70%,
      rgba(0, 0, 0, 0) 72%
    );
  }

  .blur-layer:nth-of-type(8) {
    backdrop-filter: blur(5.33px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 68%,
      rgba(0, 0, 0, 1) 71%,
      rgba(0, 0, 0, 1) 75%,
      rgba(0, 0, 0, 0) 77%
    );
  }

  .blur-layer:nth-of-type(9) {
    backdrop-filter: blur(6px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 73%,
      rgba(0, 0, 0, 1) 76%,
      rgba(0, 0, 0, 1) 80%,
      rgba(0, 0, 0, 0) 82%
    );
  }

  .blur-layer:nth-of-type(10) {
    backdrop-filter: blur(6.67px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 78%,
      rgba(0, 0, 0, 1) 81%,
      rgba(0, 0, 0, 1) 85%,
      rgba(0, 0, 0, 0) 87%
    );
  }

  .blur-layer:nth-of-type(11) {
    backdrop-filter: blur(7.33px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 83%,
      rgba(0, 0, 0, 1) 86%,
      rgba(0, 0, 0, 1) 92%,
      rgba(0, 0, 0, 0) 95%
    );
  }

  .blur-layer:nth-of-type(12) {
    backdrop-filter: blur(8px);
    mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 88%,
      rgba(0, 0, 0, 1) 93%,
      rgba(0, 0, 0, 1) 100%
    );
  }
`;

const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
  width: 100%;
  margin-bottom: -64px;
  z-index: 3;
`;

const MotionTextContent = motion(TextContent);

const Title = styled.h1`
  /* add padding bottom to avoid bottom cutoff from tight line height  */
  padding-bottom: 2px;

  font-size: 36px;
  font-weight: 400;
  line-height: 1.04;
  letter-spacing: -1.44px;

  background: linear-gradient(180deg, #1a73e8 0%, #0093f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 18px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.72px;
  color: #6c8bab;
`;

const HighlightedText = styled.span`
  color: #0093f6;
`;

const _SuggestionsContainer = styled.div`
  margin-top: 28px;
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const MotionSuggestionsContainer = motion(_SuggestionsContainer);

const SuggestionButton = styled.button`
  width: fit-content;
  margin: 0 auto;

  background: rgba(171, 220, 246, 0.31);
  border: 1px solid rgba(0, 147, 246, 0.16);
  border-radius: 500px;
  padding: 7px 16px;

  font-size: 14px;
  font-weight: 400;
  letter-spacing: -0.56px;
  color: #0093f6;
  cursor: pointer;
  transition: background-color 0.2s ease;
`;

const MotionSuggestionButton = motion(SuggestionButton);

const InputContainer = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;

  display: flex;
  align-items: center;
  gap: 8px;

  padding: 12px;
  background: linear-gradient(
    180deg,
    rgba(234, 248, 255, 0.88) 0%,
    rgba(238, 250, 255, 0.88) 100%
  );
  border-radius: 8px;
  box-shadow: 0px 4px 9.9px 0px #bae3f8;
`;

const MotionInputContainer = motion(InputContainer);

const InputIcon = styled.div`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`;

const InputContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;
const InputField = styled.input`
  font-size: 16px;
  font-weight: 400;
  letter-spacing: -0.64px;
  color: #000000;
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  ::placeholder {
    color: #6c8bab;
  }
`;
const InputLabel = styled.span`
  font-size: 12px;
  font-weight: 400;
  letter-spacing: -0.48px;
  color: #0093f6;
`;

const SendButton = styled.button`
  flex-shrink: 0;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(0, 147, 246, 0.16);
  background: rgba(171, 220, 246, 0.31);
  color: #0093f6;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  &:not(:disabled):hover {
    background: rgba(171, 220, 246, 0.45);
  }
`;

const BottomBlurImage = styled.img`
  width: 377px;
  height: 212px;

  object-fit: contain;
  object-position: bottom center;

  position: absolute;
  left: 50%;
  bottom: -1px;
  transform: translateX(-50%);
  z-index: -1;
`;

const ChatArea = styled.div`
  width: 100%;
  max-width: 407px;
  margin: 8px auto 68px; /* leave space for input */
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
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
