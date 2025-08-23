import { useAtom } from 'jotai';
import React, { useCallback } from 'react';

import { ViewContainer } from './ViewContainer';
import { currentViewAtom, errorAtom, loadingAtom, messagesAtom, suppressActionParsingAtom } from './atoms';
import { ChatMessage, ChatView } from './views/ChatView';
import { IntroView } from './views/IntroView';

interface PagemateChatProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSuggestions: string[]; // Required
}

export const PagemateChat: React.FC<PagemateChatProps> = ({
  isOpen,
  onClose,
  defaultSuggestions,
}) => {
  const [currentView, setCurrentView] = useAtom(currentViewAtom);
  const [messages, setMessages] = useAtom(messagesAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [error, setError] = useAtom(errorAtom);
  const [suppressActions, setSuppressActions] = useAtom(suppressActionParsingAtom);

  const abortControllerRef = React.useRef<AbortController | null>(null);
  const messagesRef = React.useRef<ChatMessage[]>(messages);
  const loadingRef = React.useRef<boolean>(loading);
  const restartPendingRef = React.useRef<boolean>(false);
  const currentUrlRef = React.useRef<string>(
    typeof window !== 'undefined' ? window.location.href : '',
  );

  React.useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  React.useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  type ToolAction =
    | { type: 'clickByText'; text: string }
    | { type: 'highlightByText'; text: string }
    | { type: 'retrieve'; query: string; limit?: number; documentId?: string | null };

  type ToolExecResult = {
    success: boolean;
    kind: ToolAction['type'];
    ragContext?: string | null;
  };

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
    if (m1) return { type: 'highlightByText', text: m1[1] }; // default to highlight mode

    // Match: click '...'
    const re2 = /click\s+["']([^"']+)["']/i;
    const m2 = text.match(re2);
    if (m2) return { type: 'highlightByText', text: m2[1] }; // default to highlight mode

    // Match: click ... button
    const re3 = /click\s+(.+?)\s+button/i;
    const m3 = text.match(re3);
    if (m3) return { type: 'highlightByText', text: m3[1] }; // default to highlight mode

    // Note: XPath commands removed. No parsing for xpath-based actions.

    // Match: retrieve/search <query>
    const r1 = text.match(/^(?:retrieve|search)\s+(.+)/i);
    if (r1) return { type: 'retrieve', query: r1[1].trim() };

    return null;
  };

  const executeTool = async (tool: ToolAction): Promise<ToolExecResult> => {
    switch (tool.type) {
      case 'clickByText': {
        const el = findClickableByText(tool.text);
        if (!el) return { success: false, kind: tool.type };
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          flashHighlight(el);
          (el as HTMLElement).click();
          return { success: true, kind: tool.type };
        } catch {
          return { success: false, kind: tool.type };
        }
      }
      case 'highlightByText': {
        const el = findClickableByText(tool.text);
        if (!el) return { success: false, kind: tool.type };
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          showSpotlight(el);
          return { success: true, kind: tool.type };
        } catch {
          return { success: false, kind: tool.type };
        }
      }
      // XPath-based actions have been removed
      case 'retrieve': {
        try {
          const { query, limit = 5, documentId = null } = tool;
          const chunks = await fetchRetrieval(query, { limit, documentId });
          const summary = formatRetrievalSummary(query, chunks);
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: summary },
          ]);
          try { setSuppressActions(false); } catch {}
          const ragText = buildRagContextFromChunks(query, chunks);
          return { success: true, kind: tool.type, ragContext: ragText };
        } catch (e: any) {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: `⚠️ Retrieval failed: ${e?.message || 'Unknown error'}` },
          ]);
          return { success: false, kind: tool.type };
        }
      }
      default:
        return { success: false, kind: 'clickByText' };
    }
  };

  const parseAssistantActions = (text: string): ToolAction[] => {
    const actions: ToolAction[] = [];
    // Match patterns like:
    // ACTION SPOTLIGHT Start Building
    // ACTION CLICK "Start Building"
    // (XPath-based directives removed)
    // Capture verb and the rest of the line as target (quotes/backticks optional)
    const re = /ACTION\s+([A-Z_]+)\s*[:\-]?\s*(.+)$/gim;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const verb = (m[1] || '').toUpperCase().trim();
      let target = (m[2] || '').trim();
      // strip surrounding quotes/backticks if present
      if (
        (target.startsWith('"') && target.endsWith('"')) ||
        (target.startsWith("'") && target.endsWith("'")) ||
        (target.startsWith('`') && target.endsWith('`'))
      ) {
        target = target.slice(1, -1);
      }
      if (!target) continue;
      if (verb === 'SPOTLIGHT') {
        actions.push({ type: 'highlightByText', text: target });
      } else if (verb === 'CLICK') {
        // Default to highlight mode instead of clicking
        actions.push({ type: 'highlightByText', text: target });
      } else if (verb === 'RETRIEVE') {
        actions.push({ type: 'retrieve', query: target });
      } else if (verb === 'CLICK_XPATH' || verb === 'SPOTLIGHT_XPATH') {
        // Ignore XPath-specific directives
      }
    }
    return actions;
  };

  const callAI = useCallback(
    async (
      msgs: ChatMessage[],
      opts: { ragContext?: string | null; signal?: AbortSignal } = {},
    ) => {
      const resp = await fetch('https://pagemate.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: msgs,
          model: 'solar-pro2',
          pageHtml:
            typeof document !== 'undefined' ? document.body.innerHTML : '',
          ...(opts.ragContext ? { ragContext: opts.ragContext } : {}),
        }),
        signal: opts.signal,
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Failed to fetch');
      return (data?.content as string) || '';
    },
    [],
  );

  const restartAgent = useCallback(async () => {
    if (restartPendingRef.current) return;
    restartPendingRef.current = true;
    try {
      const baseMessages = messagesRef.current;
      if (!baseMessages || baseMessages.length === 0) return;
      // Start a fresh controller and mark loading
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      setLoading(true);
      let working: ChatMessage[] = [...baseMessages];

      let reply: string | null = null;
      try {
        reply = await callAI(working, { signal: abortControllerRef.current.signal });
      } catch (e: any) {
        if (e?.name === 'AbortError') return; // stopped externally
        throw e;
      }
      if (reply) {
        working = [...working, { role: 'assistant', content: reply }];
        messagesRef.current = working;
        setMessages(working);
        try { setSuppressActions(false); } catch {}
      }

      const maxFollowups = 3;
      let followups = 0;
      while (followups < maxFollowups) {
        if (abortControllerRef.current?.signal.aborted) return;
        const actions = parseAssistantActions(reply || '');
        if (!actions.length) break;
        let rag: string | null = null;
        for (const a of actions) {
          const res = await executeTool(a);
          if (res.kind === 'retrieve' && res.ragContext) {
            rag = rag ? `${rag}\n${res.ragContext}` : res.ragContext;
          }
        }
        if (!rag) break;
        try {
          reply = await callAI(working, {
            ragContext: rag,
            signal: abortControllerRef.current?.signal,
          });
        } catch (e: any) {
          if (e?.name === 'AbortError') return;
          throw e;
        }
        if (reply) {
          working = [...working, { role: 'assistant', content: reply }];
          messagesRef.current = working;
          setMessages(working);
          try { setSuppressActions(false); } catch {}
        }
        followups++;
      }
    } finally {
      restartPendingRef.current = false;
      setLoading(false);
    }
  }, [callAI, executeTool, parseAssistantActions, setLoading, setMessages]);

  React.useEffect(() => {
    const win: Window | undefined = typeof window !== 'undefined' ? window : undefined;
    if (!win) return;
    const origPush = win.history.pushState.bind(win.history);
    const origReplace = win.history.replaceState.bind(win.history);
    const emitNav = () => win.dispatchEvent(new Event('pagemate:navigation'));
    // Patch pushState/replaceState to catch SPA navigations
    (win.history.pushState as any) = function (
      ...args: Parameters<History['pushState']>
    ) {
      const ret = origPush(...args);
      emitNav();
      return ret;
    };
    (win.history.replaceState as any) = function (
      ...args: Parameters<History['replaceState']>
    ) {
      const ret = origReplace(...args);
      emitNav();
      return ret;
    };

    const handleNav = () => {
      const href = win.location.href;
      if (href === currentUrlRef.current) return;
      currentUrlRef.current = href;
      try { removeSpotlight(); } catch {}
      try { setSuppressActions(true); } catch {}
      if (loadingRef.current) {
        abortControllerRef.current?.abort();
        setTimeout(() => restartAgent(), 0);
      } else if (messagesRef.current.length > 0) {
        setTimeout(() => restartAgent(), 0);
      }
    };
    win.addEventListener('pagemate:navigation', handleNav);
    win.addEventListener('popstate', handleNav);
    win.addEventListener('hashchange', handleNav);
    return () => {
      try {
        (win.history.pushState as any) = origPush as any;
        (win.history.replaceState as any) = origReplace as any;
        win.removeEventListener('pagemate:navigation', handleNav);
        win.removeEventListener('popstate', handleNav);
        win.removeEventListener('hashchange', handleNav);
      } catch {}
    };
  }, [restartAgent]);

  // XPath detection removed

  const findClickableByText = (targetText: string): HTMLElement | null => {
    const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
    const t = norm(targetText);

    const getLabel = (el: HTMLElement): string => {
      // Prefer visible text
      let txt = (el.textContent || '').trim();
      if (txt) return txt;
      // Accessible name via aria-label
      const aria = el.getAttribute('aria-label');
      if (aria) return aria;
      // aria-labelledby references
      const labelledby = el.getAttribute('aria-labelledby');
      if (labelledby) {
        const ids = labelledby.split(/\s+/).filter(Boolean);
        const parts: string[] = [];
        ids.forEach((id) => {
          const ref = document.getElementById(id);
          if (ref) parts.push((ref.textContent || '').trim());
        });
        const joined = parts.join(' ');
        if (joined.trim()) return joined;
      }
      // title attribute
      const title = el.getAttribute('title');
      if (title) return title;
      // Input value/placeholder
      if (el instanceof HTMLInputElement) {
        if (el.value) return el.value;
        if (el.placeholder) return el.placeholder;
      }
      // Alt text from child images/icons
      const img = el.querySelector('img[alt]') as HTMLImageElement | null;
      if (img?.alt) return img.alt;
      return '';
    };

    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>(
        'a, [role="link"], button, [role="button"], input[type="button"], input[type="submit"]',
      ),
    );
    const visible = candidates.filter((el) => isVisible(el));
    // Prefer exact match on accessible label, then includes
    const exact = visible.find((el) => norm(getLabel(el)) === t);
    if (exact) return exact;
    const partial = visible.find((el) => norm(getLabel(el)).includes(t));
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

  // XPath helpers removed

  // Compute a border-radius string expanded by `expandPx` to account for the overlay padding
  const computeExpandedBorderRadius = (el: HTMLElement, expandPx = 6): string => {
    const cs = window.getComputedStyle(el);
    const parseCorner = (val: string) => {
      if (!val) return `${Math.max(0, expandPx + 8)}px`;
      // Preserve percentage radii as-is (keeps circles/ellipses correct on the overlay)
      if (/%/.test(val)) return val;
      const num = parseFloat(val);
      if (Number.isFinite(num)) return `${Math.max(0, num + expandPx)}px`;
      return `${Math.max(0, expandPx + 8)}px`;
    };
    const tl = parseCorner(cs.borderTopLeftRadius);
    const tr = parseCorner(cs.borderTopRightRadius);
    const br = parseCorner(cs.borderBottomRightRadius);
    const bl = parseCorner(cs.borderBottomLeftRadius);
    return `${tl} ${tr} ${br} ${bl}`;
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
      borderRadius: computeExpandedBorderRadius(el, 6),
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
    const radius = computeExpandedBorderRadius(activeSpotlightTarget, 6);
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
    // Detach listeners used to reposition the overlay
    window.removeEventListener('scroll', positionSpotlight, true);
    window.removeEventListener('resize', positionSpotlight);
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

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      setError(null);
      setLoading(true);

      // If starting from the intro view, treat this as a new task
      // and clear any previous conversation history.
      const isNewTask = currentView === 'intro';
      let workingMessages: ChatMessage[] = [
        ...(isNewTask ? [] : messages),
        { role: 'user', content: text.trim() },
      ];
      setMessages(workingMessages);
      try { setSuppressActions(false); } catch {}

      // Switch to chat view if we're still in intro
      if (currentView === 'intro') {
        setCurrentView('chat');
      }

      try {
        // Helper to call the chat API with optional rag context
        const callAI = async (
          msgs: ChatMessage[],
          opts: { ragContext?: string | null } = {},
        ) => {
          const resp = await fetch('https://pagemate.app/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: msgs,
              model: 'solar-pro2',
              pageHtml:
                typeof document !== 'undefined' ? document.body.innerHTML : '',
              ...(opts.ragContext ? { ragContext: opts.ragContext } : {}),
            }),
            signal: abortControllerRef.current?.signal,
          });
          const data = await resp.json();
          if (!resp.ok) throw new Error(data?.error || 'Failed to fetch');
          return (data?.content as string) || '';
        };

        // Prepare abort controller for this agent run
        try { abortControllerRef.current?.abort(); } catch {}
        abortControllerRef.current = new AbortController();

        // 1) If the user message is a tool command, execute it.
        const tool = parseToolIntent(text);
        let pendingRag: string | null | undefined = null;
        if (tool) {
          const result = await executeTool(tool);
          if (tool.type === 'retrieve') {
            // Retrieval already appended a summary message
            // Capture rag context for a follow-up call
            pendingRag = result.ragContext ?? null;
          } else {
            const verb = tool.type === 'highlightByText' ? 'Highlighted' : 'Clicked';
            const successText = result.success
              ? `✅ ${verb} "${'text' in tool ? tool.text : ''}"`
              : `⚠️ Couldn't find target for "${'text' in tool ? tool.text : ''}"`;
            workingMessages = [
              ...workingMessages,
              { role: 'assistant', content: successText },
            ];
            messagesRef.current = workingMessages;
            setMessages(workingMessages);
            try { setSuppressActions(false); } catch {}
          }
          // Only call the agent again after a RETRIEVE tool
          if (tool.type === 'retrieve') {
            const maxFollowups = 3;
            let followups = 0;
            while (followups < maxFollowups) {
              if (abortControllerRef.current?.signal.aborted) return;
              const reply = await callAI(workingMessages, { ragContext: pendingRag });
              if (reply) {
                workingMessages = [
                  ...workingMessages,
                  { role: 'assistant', content: reply },
                ];
                messagesRef.current = workingMessages;
                setMessages(workingMessages);
                try { setSuppressActions(false); } catch {}
              }
              // Parse and execute any ACTION directives
              const actions = parseAssistantActions(reply);
              if (!actions.length) break;
              // Execute tools; only continue if at least one RETRIEVE occurred
              pendingRag = null;
              let executedRetrieve = false;
              for (const a of actions) {
                const res = await executeTool(a);
                if (res.kind === 'retrieve' && res.ragContext) {
                  executedRetrieve = true;
                  pendingRag = pendingRag
                    ? `${pendingRag}\n${res.ragContext}`
                    : res.ragContext;
                }
              }
              if (!executedRetrieve) break;
              followups++;
            }
          }
          return;
        }

        // 2) Normal flow: call AI, then execute any tools and call again, up to a small limit
        let reply = await callAI(workingMessages);
        if (reply) {
          workingMessages = [
            ...workingMessages,
            { role: 'assistant', content: reply },
          ];
          messagesRef.current = workingMessages;
          setMessages(workingMessages);
          try { setSuppressActions(false); } catch {}
        }

        const maxFollowups = 3;
        let followups = 0;
        while (followups < maxFollowups) {
          const actions = parseAssistantActions(reply);
          if (!actions.length) break;
          let rag: string | null = null;
          for (const a of actions) {
            const res = await executeTool(a);
            if (res.kind === 'retrieve' && res.ragContext) {
              rag = rag ? `${rag}\n${res.ragContext}` : res.ragContext;
            }
          }
          // Only call AI again if a RETRIEVE tool provided context
          if (!rag) break;
          if (abortControllerRef.current?.signal.aborted) return;
          reply = await callAI(workingMessages, { ragContext: rag });
          if (reply) {
            workingMessages = [
              ...workingMessages,
              { role: 'assistant', content: reply },
            ];
            messagesRef.current = workingMessages;
            setMessages(workingMessages);
            try { setSuppressActions(false); } catch {}
          }
          followups++;
        }
      } catch (e: any) {
        console.error(e);
        setError(e?.message || 'Failed to fetch response');
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, currentView],
  );

  // --- Retrieval helpers ---
  type DocumentChunk = {
    id?: string;
    document_id?: string | null;
    content?: string;
    text?: string;
    score?: number;
    metadata?: Record<string, any>;
  };

  async function fetchRetrieval(
    query: string,
    opts: { limit?: number; documentId?: string | null; signal?: AbortSignal } = {},
  ): Promise<DocumentChunk[]> {
    const baseUrl = 'https://api.pagemate.app';
    const tenantId = process.env.NEXT_PUBLIC_PAGEMATE_TENANT_ID as string | undefined;
    if (!tenantId) throw new Error('Missing NEXT_PUBLIC_PAGEMATE_TENANT_ID');
    const params = new URLSearchParams();
    params.set('query', query);
    if (opts.limit) params.set('limit', String(opts.limit));
    if (opts.documentId) params.set('document_id', String(opts.documentId));
    const url = `${baseUrl}/tenants/${encodeURIComponent(
      tenantId,
    )}/retrieval?${params.toString()}`;
    const resp = await fetch(url, { method: 'GET', signal: opts.signal });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      throw new Error(
        `HTTP ${resp.status} ${resp.statusText}${txt ? `: ${txt}` : ''}`,
      );
    }
    return (await resp.json()) as DocumentChunk[];
  }

  function formatRetrievalSummary(
    query: string,
    chunks: DocumentChunk[],
  ): string {
    const lines: string[] = [];
    lines.push(`RAG_BLOCK_START Retrieved ${chunks.length} results for "${query}"`);
    const top = chunks.slice(0, Math.min(5, chunks.length));
    for (let i = 0; i < top.length; i++) {
      const c = top[i];
      const text = (c.content || c.text || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 280);
      const doc = c.document_id ? ` doc:${c.document_id}` : '';
      const score =
        typeof c.score === 'number' ? ` score:${c.score.toFixed(3)}` : '';
      lines.push(`- [${i + 1}]${doc}${score} ${text}`);
    }
    lines.push('RAG_BLOCK_END');
    lines.push('');
    lines.push('ACTION NOTE Retrieved context loaded.');
    return lines.join('\n');
  }

  function buildRagContextFromChunks(
    query: string,
    chunks: DocumentChunk[],
  ): string {
    const parts: string[] = [];
    parts.push(`RAG_CONTEXT Query: ${query}`);
    const top = chunks.slice(0, Math.min(8, chunks.length));
    for (let i = 0; i < top.length; i++) {
      const c = top[i];
      const text = (c.content || c.text || '').replace(/\s+/g, ' ').trim();
      parts.push(
        `[${i + 1}] doc:${c.document_id ?? ''} score:${
          typeof c.score === 'number' ? c.score.toFixed(4) : ''
        }`,
      );
      parts.push(text);
    }
    return parts.join('\n');
  }

  const handleSwitchToChat = useCallback(
    (initialMessage: string) => {
      sendMessage(initialMessage);
    },
    [sendMessage],
  );

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
          suggestions={defaultSuggestions}
        />
      ) : (
        <ChatView
          messages={messages}
          loading={loading}
          error={error}
          suppressActions={suppressActions}
        />
      )}
    </ViewContainer>
  );
};
