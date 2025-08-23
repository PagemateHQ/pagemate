import React, { useState, useCallback, useRef } from 'react';

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
    const re = /ACTION\s+([A-Z_]+)\s*[:\-]?\s*["'"]?([^"'"\n]+)["'"]?/gim;
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
      // Tool calling (local): check if user asked to click/highlight by text
      const tool = parseToolIntent(text);
      if (tool) {
        const ok = executeTool(tool);
        const verb = tool.type === 'highlightByText' ? 'Highlighted' : 'Clicked';
        const assistantText = ok
          ? `✅ ${verb} "${'text' in tool ? tool.text : ''}"`
          : `⚠️ Couldn't find target for "${'text' in tool ? tool.text : ''}"`;
        setMessages((prev) => [...prev, { role: 'assistant', content: assistantText }]);
        setLoading(false);
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
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        // Parse any ACTION directives in the assistant reply and execute tools.
        try {
          const actions = parseAssistantActions(reply);
          actions.forEach((a) => executeTool(a));
        } catch {}
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