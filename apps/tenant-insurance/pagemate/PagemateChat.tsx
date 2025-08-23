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
    | { type: 'clickBySelector'; selector: string }
    | { type: 'highlightBySelector'; selector: string }
    | { type: 'autofill'; spec?: string; fields?: Record<string, string> };

  type ToolExecResult = {
    success: boolean;
    kind: ToolAction['type'];
    ragContext?: string | null;
    details?: string;
  };

  const parseToolIntent = (raw: string): ToolAction | null => {
    const text = raw.trim();
    // Match: highlight ...
    const h1 = text.match(/highlight\s+["']([^"']+)["']/i);
    if (h1) return { type: 'highlightByText', text: h1[1] };
    const h2 = text.match(/highlight\s+(.+?)\s+(?:button|link|field)?$/i);
    if (h2) return { type: 'highlightByText', text: h2[1] };

    // Match: spotlight ... (treat same as highlight)
    const s1 = text.match(/spotlight\s+["']([^"']+)["']/i);
    if (s1) return { type: 'highlightByText', text: s1[1] };
    const s2 = text.match(/spotlight\s+(.+?)\s+(?:button|link|field)?$/i);
    if (s2) return { type: 'highlightByText', text: s2[1] };
    const s3 = text.match(/^spotlight\s+(.+)$/i);
    if (s3) return { type: 'highlightByText', text: s3[1] };

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

    // Match: autofill <spec>
    const a1 = text.match(/^autofill\s+([\s\S]+)/i);
    if (a1) {
      const spec = a1[1].trim();
      const fields = parseAutofillSpec(spec);
      return { type: 'autofill', spec, fields };
    }

    return null;
  };

  const parseAutofillSpec = (raw: string | undefined | null): Record<string, string> => {
    const out: Record<string, string> = {};
    const s = String(raw || '').trim();
    if (!s) return out;
    // Try JSON object first
    try {
      if (s.startsWith('{') && s.endsWith('}')) {
        const obj = JSON.parse(s);
        if (obj && typeof obj === 'object') {
          for (const [k, v] of Object.entries(obj)) {
            if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
              out[String(k)] = String(v);
            }
          }
          return out;
        }
      }
    } catch {}
    // Fallback: parse key=value or key: value pairs separated by semicolons or newlines
    const normalized = s.replace(/\r/g, '\n');
    const lines = normalized
      .split(/\n|;/)
      .map((l) => l.trim())
      .filter(Boolean);
    for (const line of lines) {
      const m = line.match(/^([^:=]+)\s*[:=]\s*([\s\S]+)$/);
      if (!m) continue;
      let key = (m[1] || '').trim();
      let val = (m[2] || '').trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'")) ||
        (val.startsWith('`') && val.endsWith('`'))
      ) {
        val = val.slice(1, -1);
      }
      if (key) out[key] = val;
    }
    return out;
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
        const el = findHighlightableByText(tool.text);
        if (!el) return { success: false, kind: tool.type };
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          showSpotlight(el);
          return { success: true, kind: tool.type };
        } catch {
          return { success: false, kind: tool.type };
        }
      }
      case 'clickBySelector': {
        const el = findElementBySelector(tool.selector);
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
      case 'highlightBySelector': {
        const el = findElementBySelector(tool.selector);
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
      case 'autofill': {
        try {
          const fields = tool.fields || parseAutofillSpec(tool.spec);
          const result = autofillFields(fields);
          const statusLine = result.success
            ? `✅ Autofilled ${result.filledCount} ${result.filledCount === 1 ? 'field' : 'fields'}`
            : `⚠️ Autofill failed: ${result.error || 'No matching fields'}`;
          const details = result.filled.length
            ? `\n${result.filled
                .map((f) => `- ${f.label || f.key}: ${truncateText(f.value, 80)}`)
                .join('\n')}`
            : '';
          try {
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: `${statusLine}${details}` },
            ]);
            try { setSuppressActions(false); } catch {}
          } catch {}
          return { success: result.success, kind: tool.type, details: statusLine };
        } catch (e: any) {
          return { success: false, kind: tool.type, details: e?.message };
        }
      }
      default:
        return { success: false, kind: 'clickByText' };
    }
  };

  const parseAssistantActions = (text: string): ToolAction[] => {
    const actions: ToolAction[] = [];
    // Try JSON envelope: { reply: string, action: { verb, target } }
    try {
      const trimmed = (text || '').trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const obj = JSON.parse(trimmed);
        if (obj && typeof obj === 'object' && obj.action && obj.action.verb) {
          const verb = String(obj.action.verb || '').toUpperCase();
          const rawTarget = (obj.action as any).target;
          const target: string =
            typeof rawTarget === 'string'
              ? rawTarget
              : rawTarget != null
              ? JSON.stringify(rawTarget)
              : '';
          const isSelector = isLikelyCssSelector(target);
          if (verb === 'SPOTLIGHT') {
            actions.push(
              isSelector
                ? { type: 'highlightBySelector', selector: target }
                : { type: 'highlightByText', text: target },
            );
          } else if (verb === 'CLICK') {
            // Keep non-destructive default: highlight instead of clicking
            actions.push(
              isSelector
                ? { type: 'highlightBySelector', selector: target }
                : { type: 'highlightByText', text: target },
            );
          } else if (verb === 'RETRIEVE') {
            // Ignore RETRIEVE (server injects RAG automatically)
          } else if (verb === 'AUTOFILL') {
            let fields: Record<string, string> = {};
            if (rawTarget && typeof rawTarget === 'object') {
              for (const [k, v] of Object.entries(rawTarget)) {
                if (!k) continue;
                const key = String(k);
                const val =
                  typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
                    ? String(v)
                    : JSON.stringify(v);
                fields[key] = val;
              }
            } else {
              fields = parseAutofillSpec(target);
            }
            actions.push({ type: 'autofill', spec: target, fields });
          }
        }
      }
    } catch {}

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
        // Ignore RETRIEVE actions
      } else if (verb === 'AUTOFILL') {
        const fields = parseAutofillSpec(target);
        actions.push({ type: 'autofill', spec: target, fields });
      } else if (verb === 'CLICK_XPATH' || verb === 'SPOTLIGHT_XPATH') {
        // Ignore XPath-specific directives
      }
    }
    return actions;
  };

  const isLikelyCssSelector = (s: string): boolean => {
    const t = (s || '').trim();
    if (!t) return false;
    return /^[#\.\[]/.test(t) || /[\[\]#.>:~+]/.test(t);
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
          model: process.env.NEXT_PUBLIC_PAGEMATE_MODEL || 'solar-pro2',
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
      try { refreshInjectedHtml(); } catch {}
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

      // No RETRIEVE tool. RAG is injected by server; do not loop.
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

    const disableActionLines = (text: string): string => {
      try {
        // Replace actionable directives so they won't match our ACTION parser,
        // while keeping human-readable content.
        return text.replace(/^(\s*)ACTION\s+([A-Z_]+)\b(.*)$/gim, (_m, ws: string, verb: string, rest: string) => {
          const v = (verb || '').toUpperCase();
          if (v === 'NOTE') return `${ws}NOTE${rest}`.trimEnd();
          return `${ws}NOTE (${v})${rest}`.trimEnd();
        });
      } catch {
        return text;
      }
    };

    const handleNav = () => {
      const href = win.location.href;
      if (href === currentUrlRef.current) return;
      currentUrlRef.current = href;
      try { refreshInjectedHtml(); } catch {}
      try { setSuppressActions(true); } catch {}
      // Disable already-executed commands in existing messages
      try {
        if (messagesRef.current && messagesRef.current.length) {
          const sanitized: ChatMessage[] = messagesRef.current.map((m) => ({
            ...m,
            content: disableActionLines(m.content || ''),
          }));
          messagesRef.current = sanitized;
          setMessages(sanitized);
        }
      } catch {}
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

  // For spotlighting, allow matching common containers like div as well
  const findHighlightableByText = (targetText: string): HTMLElement | null => {
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
        'a, [role="link"], button, [role="button"], input[type="button"], input[type="submit"], div',
      ),
    );
    const visible = candidates.filter((el) => isVisible(el));
    // Prefer exact match on accessible label, then includes
    const exact = visible.find((el) => norm(getLabel(el)) === t);
    if (exact) return exact;
    const partial = visible.find((el) => norm(getLabel(el)).includes(t));
    return partial || null;
  };

  const findElementBySelector = (selector: string): HTMLElement | null => {
    try {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el && isVisible(el)) return el;
      return el || null;
    } catch {
      return null;
    }
  };

  // --- Autofill helpers ---
  const truncateText = (s: string, max = 80): string => {
    const t = String(s);
    return t.length > max ? `${t.slice(0, max - 1)}…` : t;
  };

  const normText = (s: string): string => s.replace(/\s+/g, ' ').trim().toLowerCase();

  const getAssociatedLabel = (el: HTMLElement): string => {
    try {
      // label[for] association
      const id = el.getAttribute('id');
      if (id) {
        const lab = document.querySelector(`label[for="${CSS.escape(id)}"]`);
        if (lab) return (lab.textContent || '').trim();
      }
      // wrapped by <label>
      let parent: HTMLElement | null = el;
      while (parent) {
        if (parent.tagName.toLowerCase() === 'label') {
          return (parent.textContent || '').trim();
        }
        parent = parent.parentElement;
      }
      // aria-label
      const aria = el.getAttribute('aria-label');
      if (aria) return aria.trim();
      // aria-labelledby
      const labelledby = el.getAttribute('aria-labelledby');
      if (labelledby) {
        const ids = labelledby.split(/\s+/).filter(Boolean);
        const texts: string[] = [];
        ids.forEach((i) => {
          const ref = document.getElementById(i);
          if (ref) texts.push((ref.textContent || '').trim());
        });
        if (texts.length) return texts.join(' ').trim();
      }
    } catch {}
    return '';
  };

  const collectFormFields = (): Array<{
    el: HTMLElement;
    tag: string;
    type: string;
    label: string;
    placeholder: string;
    name: string;
    id: string;
    scoreWith: (key: string) => number;
  }> => {
    const list: Array<{
      el: HTMLElement;
      tag: string;
      type: string;
      label: string;
      placeholder: string;
      name: string;
      id: string;
      scoreWith: (key: string) => number;
    }> = [];
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])',
      ),
    );
    for (const n of nodes) {
      if (!isVisible(n)) continue;
      const tag = n.tagName.toLowerCase();
      const type = (n as HTMLInputElement).type?.toLowerCase?.() || tag;
      const label = getAssociatedLabel(n) || '';
      const placeholder = (n.getAttribute('placeholder') || '').trim();
      const name = (n.getAttribute('name') || '').trim();
      const id = (n.getAttribute('id') || '').trim();
      const aliases = [
        label,
        placeholder,
        name,
        id,
        n.getAttribute('autocomplete') || '',
        type,
      ]
        .map((x) => normText(String(x || '')))
        .filter(Boolean);
      const uniqueAliases = Array.from(new Set(aliases));
      const scoreWith = (key: string): number => {
        const k = normText(key);
        if (!k) return 0;
        let best = 0;
        for (const a of uniqueAliases) {
          if (!a) continue;
          if (a === k) best = Math.max(best, 100);
          else if (a.includes(k) || k.includes(a)) best = Math.max(best, 60);
          else {
            // token overlap
            const at = new Set(a.split(/[^a-z0-9]+/g).filter(Boolean));
            const kt = new Set(k.split(/[^a-z0-9]+/g).filter(Boolean));
            const inter = Array.from(kt).filter((t) => at.has(t));
            if (inter.length) best = Math.max(best, Math.min(50, inter.length * 10));
          }
        }
        return best;
      };
      list.push({ el: n, tag, type, label, placeholder, name, id, scoreWith });
    }
    return list;
  };

  const setElementValue = (el: HTMLElement, value: string): boolean => {
    try {
      if (el instanceof HTMLInputElement) {
        const t = (el.type || '').toLowerCase();
        if (t === 'checkbox') {
          const truthy = /^(1|y|yes|true|on|checked)$/i.test(String(value));
          if (el.checked !== truthy) {
            el.checked = truthy;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
          return true;
        }
        if (t === 'radio') {
          // choose radio in the same group by matching value or label text
          const name = el.name;
          const group = Array.from(
            document.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${CSS.escape(name)}"]`),
          );
          const targetVal = String(value).trim().toLowerCase();
          for (const r of group) {
            const lab = getAssociatedLabel(r).toLowerCase();
            if (
              (r.value && r.value.toLowerCase() === targetVal) ||
              (lab && (lab === targetVal || lab.includes(targetVal)))
            ) {
              if (!r.checked) {
                r.checked = true;
                r.dispatchEvent(new Event('input', { bubbles: true }));
                r.dispatchEvent(new Event('change', { bubbles: true }));
              }
              flashHighlight(r);
              return true;
            }
          }
          return false;
        }
        el.value = String(value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.blur?.();
        return true;
      }
      if (el instanceof HTMLTextAreaElement) {
        el.value = String(value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.blur?.();
        return true;
      }
      if (el instanceof HTMLSelectElement) {
        const val = String(value).trim().toLowerCase();
        let matched = false;
        for (const opt of Array.from(el.options)) {
          const txt = (opt.textContent || '').trim().toLowerCase();
          const v = (opt.value || '').trim().toLowerCase();
          if (v === val || txt === val || txt.includes(val)) {
            el.value = opt.value;
            matched = true;
            break;
          }
        }
        if (!matched) el.value = String(value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.blur?.();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const autofillFields = (
    fields: Record<string, string> | undefined | null,
  ): {
    success: boolean;
    filledCount: number;
    filled: Array<{ key: string; label: string; value: string }>;
    error?: string;
  } => {
    const mapping = fields || {};
    const entries = Object.entries(mapping)
      .map(([k, v]) => [k.trim(), String(v)] as const)
      .filter(([k]) => !!k);
    if (!entries.length) return { success: false, filledCount: 0, filled: [], error: 'No fields provided' };

    const candidates = collectFormFields();
    const filled: Array<{ key: string; label: string; value: string }> = [];
    for (const [key, value] of entries) {
      // rank candidates by score
      const ranked = candidates
        .map((c) => ({ c, s: c.scoreWith(key) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s);
      if (!ranked.length) continue;
      const target = ranked[0].c.el;
      const ok = setElementValue(target as any, value);
      if (ok) {
        const label = getAssociatedLabel(target) || (target.getAttribute('placeholder') || '') || '';
        try { flashHighlight(target); } catch {}
        filled.push({ key, label, value });
      }
    }
    return { success: filled.length > 0, filledCount: filled.length, filled };
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

  // Refresh injected DOM/CSS used for highlighting to avoid stale elements
  const refreshInjectedHtml = () => {
    try { removeSpotlight(); } catch {}
    try {
      document
        .querySelectorAll('.pagemate-spotlight-overlay')
        .forEach((n) => n.remove());
    } catch {}
    try {
      const st = document.getElementById('pagemate-spotlight-styles');
      if (st) st.remove();
    } catch {}
    try { ensureSpotlightStyles(); } catch {}
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
              model: process.env.NEXT_PUBLIC_PAGEMATE_MODEL || 'solar-pro2',
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
        try { refreshInjectedHtml(); } catch {}

        // 1) If the user message is a tool command, execute it (no RETRIEVE tool).
        const tool = parseToolIntent(text);
        if (tool) {
          const result = await executeTool(tool);
          if (tool.type === 'autofill') {
            // Detailed message already appended inside executeTool('autofill')
            // Sync workingMessages to the latest state
            workingMessages = messagesRef.current;
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
          return;
        }

        // 2) Normal flow: call AI, then execute any tools and call again, up to a small limit
        try { refreshInjectedHtml(); } catch {}
        let reply = await callAI(workingMessages);
        // Parse possible JSON action envelope
        let envelopeActions: ToolAction[] = [];
        try {
          const trimmed = (reply || '').trim();
          if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            const obj = JSON.parse(trimmed);
            if (obj && typeof obj === 'object') {
              if (typeof obj.reply === 'string') reply = obj.reply;
              if (obj.action && obj.action.verb) {
                envelopeActions = parseAssistantActions(JSON.stringify(obj));
              }
            }
          }
        } catch {}
        if (reply) {
          workingMessages = [
            ...workingMessages,
            { role: 'assistant', content: reply },
          ];
          messagesRef.current = workingMessages;
          setMessages(workingMessages);
          try { setSuppressActions(false); } catch {}
        }

        // No RETRIEVE follow-up loops; execute at most one round of actions.
        const actions = [...envelopeActions, ...parseAssistantActions(reply)];
        for (const a of actions) {
          await executeTool(a);
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
