import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

import { stripJunk } from '../../utils/stripJunk';
import { withCORS } from '../../lib/withCORS';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// Structured output schema and helpers
const ActionVerb = z.enum(['SPOTLIGHT', 'CLICK', 'RETRIEVE']);
const ActionSchema = z.object({ verb: ActionVerb, target: z.string().min(1) });
const AssistantSchema = z.object({ reply: z.string().min(1), action: ActionSchema });
const toTextWithSingleAction = (obj: z.infer<typeof AssistantSchema>): string => {
  const reply = obj.reply.trim();
  const target = obj.action.target.trim().replace(/^(["'`])|(["'`])$/g, '');
  return `${reply}\nACTION ${obj.action.verb} ${target}`.trim();
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      messages,
      model,
      pageHtml,
      ragContext,
    }: {
      messages: ChatMessage[];
      model?: string;
      pageHtml?: string;
      ragContext?: string;
    } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages[] is required' });
    }

    const upstageClient = new OpenAI({ apiKey: process.env.UPSTAGE_API_KEY, baseURL: 'https://api.upstage.ai/v1' });

    const DEFAULT_SYSTEM_PROMPT = [
      'You are Pagemate, an on-page AI assistant embedded in a website.',
      'Interpret imperative requests as UI actions when possible (highlight, navigate, fill forms).',
      'If the user says "highlight <text>", they mean visually highlight the on-page element — do NOT format text as bold/italics.',
      'You MUST respond as a strict JSON object, no markdown/code fences, no extra text. JSON ONLY.',
      'Schema: { "reply": string, "action": { "verb": "SPOTLIGHT"|"RETRIEVE", "target": string } }',
      'Exactly one action is required. Think carefully and choose one.',
      'Keep the "reply" concise and confirm the action (e.g., "Highlighting Start Building").',
      'When uncertain, ask a short clarifying question in "reply". Do not hallucinate UI that is not present.',
      'Never use bold text or emojis. Do not include an ACTION line; JSON only.',
    ].join(' ');

    const sanitizedHtml =
      typeof pageHtml === 'string' && pageHtml.trim()
        ? stripJunk(pageHtml)
        : '';

    const htmlContextMessage = sanitizedHtml
      ? {
          role: 'system' as const,
          content: `Context: Current page HTML (sanitized)\n${sanitizedHtml}`,
        }
      : null;

    const ragContextMessage =
      typeof ragContext === 'string' && ragContext.trim()
        ? {
            role: 'system' as const,
            content: `RAG Context\n${ragContext.trim()}`,
          }
        : null;

    // Programmatic retrieval injection on the first assistant response
    type DocumentChunk = {
      id?: string;
      document_id?: string | null;
      content?: string;
      text?: string;
      score?: number;
      metadata?: Record<string, any>;
    };

    const fetchRetrieval = async (
      query: string,
      opts: { limit?: number; documentId?: string | null } = {},
    ): Promise<DocumentChunk[]> => {
      const baseUrl = 'https://api.pagemate.app';
      const tenantId = process.env.NEXT_PUBLIC_PAGEMATE_TENANT_ID as string | undefined;
      if (!tenantId) return [];
      const params = new URLSearchParams();
      params.set('query', query);
      if (opts.limit) params.set('limit', String(opts.limit));
      if (opts.documentId) params.set('document_id', String(opts.documentId));
      const url = `${baseUrl}/tenants/${encodeURIComponent(tenantId)}/retrieval?${params.toString()}`;
      try {
        const resp = await fetch(url, { method: 'GET' });
        if (!resp.ok) return [];
        const data = (await resp.json()) as DocumentChunk[];
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    };

    const buildRagContextFromChunks = (
      query: string,
      chunks: DocumentChunk[],
    ): string => {
      const parts: string[] = [];
      parts.push(`RAG_CONTEXT Query: ${query}`);
      const top = chunks.slice(0, Math.min(8, chunks.length));
      for (let i = 0; i < top.length; i++) {
        const c = top[i];
        const text = (c.content || c.text || '').replace(/\s+/g, ' ').trim();
        const doc = c.document_id ?? '';
        const score = typeof c.score === 'number' ? c.score.toFixed(4) : '';
        parts.push(`[${i + 1}] doc:${doc} score:${score}`);
        parts.push(text);
      }
      return parts.join('\n');
    };

    const hasAssistantBefore = Array.isArray(messages) && messages.some((m) => m.role === 'assistant');
    const lastUserMsg = Array.isArray(messages)
      ? [...messages].reverse().find((m) => m.role === 'user')?.content?.trim() ?? ''
      : '';
    const shouldInjectRag = !hasAssistantBefore && !!lastUserMsg;

    let serverRagContextMessage: { role: 'system'; content: string } | null = null;
    if (shouldInjectRag) {
      const chunks = await fetchRetrieval(lastUserMsg, { limit: 8 });
      if (chunks.length > 0) {
        const ragText = buildRagContextFromChunks(lastUserMsg, chunks);
        serverRagContextMessage = { role: 'system' as const, content: `RAG Context\n${ragText}` } as const;
      }
    }

    const finalMessages = (() => {
      const m = messages.map((mm) => ({ role: mm.role, content: mm.content }));
      // If there is no system message yet, prepend default prompt.
      if (m.length === 0 || m[0].role !== 'system') {
        const head: { role: 'system'; content: string }[] = [
          { role: 'system' as const, content: DEFAULT_SYSTEM_PROMPT },
        ];
        if (htmlContextMessage) head.push(htmlContextMessage);
        if (ragContextMessage) head.push(ragContextMessage);
        if (serverRagContextMessage) head.push(serverRagContextMessage);
        return [...head, ...m];
      }
      // If caller already sent a system message, preserve it and append extra context after it.
      const head = [m[0]] as any[];
      if (htmlContextMessage) head.push(htmlContextMessage);
      if (ragContextMessage) head.push(ragContextMessage);
      if (serverRagContextMessage) head.push(serverRagContextMessage);
      return [...head, ...m.slice(1)];
    })();

    const locallyValidateOrSanitize = (
      raw: string,
    ): { content: string; structured: { reply: string; action: { verb: z.infer<typeof ActionVerb>; target: string } } | null } => {
      try {
        const parsedJson = JSON.parse(raw);
        const validated = AssistantSchema.safeParse(parsedJson);
        if (validated.success) {
          const structured = {
            reply: validated.data.reply,
            action: validated.data.action,
          };
          const content = toTextWithSingleAction(validated.data);
          return { content, structured };
        }
      } catch {}
      const lines = raw.split(/\r?\n/);
      let firstAction: { verb: string; target: string } | null = null;
      const nonAction: string[] = [];
      for (const line of lines) {
        const m = /^ACTION\s+([^\s:]+)\s*[:\-]?\s*(.+)$/i.exec(line.trim());
        if (m && !firstAction) {
          const v = (m[1] || '').toUpperCase();
          let t = (m[2] || '').trim();
          if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")) || (t.startsWith('`') && t.endsWith('`'))) t = t.slice(1, -1);
          const ok = ActionSchema.safeParse({ verb: v as any, target: t });
          if (ok.success) firstAction = ok.data as any;
        } else if (!/^ACTION\b/i.test(line.trim())) {
          nonAction.push(line);
        }
      }
      if (firstAction) {
        const content = `${nonAction.join('\n').trim()}\nACTION ${firstAction.verb} ${firstAction.target}`.trim();
        return { content, structured: null };
      }
      return { content: raw.trim(), structured: null };
    };

    let content = '';
    let structured: { reply: string; action: { verb: z.infer<typeof ActionVerb>; target: string } } | null = null;

    const mname = (model || 'solar-pro2').trim();

    const oai = new OpenAI({ apiKey: process.env.UPSTAGE_API_KEY, baseURL: 'https://api.upstage.ai/v1' });
      
        const completion: any = await oai.chat.completions.create({
          model: mname,
          messages: finalMessages,
          response_format: zodResponseFormat(AssistantSchema, 'assistant_reply'),
          temperature: 0.0,
        } as any);
        const msg = completion?.choices?.[0]?.message || {};
        if (msg.refusal) {
          content = String(msg.refusal || 'Refused');
        } else if (msg.parsed) {
          const parsed = msg.parsed as z.infer<typeof AssistantSchema>;
          structured = { reply: parsed.reply, action: parsed.action };
          content = toTextWithSingleAction(parsed);
        } else {
          const text = msg?.content?.[0]?.text || msg?.content || '';
          ({ content, structured } = locallyValidateOrSanitize(String(text || '')));
        }
      
   

    return res.status(200).json({ content, structured: structured ?? undefined });
  } catch (err: any) {
    console.error('API /api/chat error:', err);
    const message = err?.response?.data || err?.message || 'Unknown error';
    return res.status(500).json({ error: message });
  }
}

export default withCORS(handler);

export const config = {
  api: {
    bodyParser: true,
  },
};
