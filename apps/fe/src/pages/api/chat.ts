import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { z } from 'zod';

import { stripJunk } from '../../utils/stripJunk';
import { withCORS } from '../../lib/withCORS';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.UPSTAGE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing UPSTAGE_API_KEY' });
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

    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.upstage.ai/v1',
    });

    const DEFAULT_SYSTEM_PROMPT = [
      'You are Pagemate, an on-page AI assistant embedded in a website.',
      'Interpret imperative requests as UI actions when possible (click, highlight, navigate, fill forms).',
      'If the user says "highlight <text>", they mean visually highlight the on-page element — do NOT format text as bold/italics.',
      'You MUST respond as a strict JSON object, no markdown/code fences, no extra text. JSON ONLY.',
      'Schema: { "reply": string, "action": { "verb": "SPOTLIGHT"|"CLICK"|"RETRIEVE", "target": string } }',
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

    const finalMessages = (() => {
      const m = messages.map((mm) => ({ role: mm.role, content: mm.content }));
      // If there is no system message yet, prepend default prompt.
      if (m.length === 0 || m[0].role !== 'system') {
        const head: { role: 'system'; content: string }[] = [
          { role: 'system' as const, content: DEFAULT_SYSTEM_PROMPT },
        ];
        if (htmlContextMessage) head.push(htmlContextMessage);
        if (ragContextMessage) head.push(ragContextMessage);
        return [...head, ...m];
      }
      // If caller already sent a system message, preserve it and append extra context after it.
      const head = [m[0]] as any[];
      if (htmlContextMessage) head.push(htmlContextMessage);
      if (ragContextMessage) head.push(ragContextMessage);
      return [...head, ...m.slice(1)];
    })();

    // Structured Outputs via Zod (local enforcement)
    const ActionVerb = z.enum(['SPOTLIGHT', 'CLICK', 'RETRIEVE']);
    const ActionSchema = z.object({ verb: ActionVerb, target: z.string().min(1) });
    const AssistantSchema = z.object({ reply: z.string().min(1), action: ActionSchema });

    const completion = await openai.chat.completions.create({
      model: model || 'solar-pro2',
      messages: finalMessages,
      stream: false,
    });

    const raw = completion.choices?.[0]?.message?.content ?? '';


    const toTextWithSingleAction = (obj: z.infer<typeof AssistantSchema>): string => {
      const reply = obj.reply.trim();
      const target = obj.action.target.trim().replace(/^(["'`])|(["'`])$/g, '');
      return `${reply}\nACTION ${obj.action.verb} ${target}`.trim();
    };

    let content: string;
    try {
      const parsedJson = JSON.parse(raw);
      const validated = AssistantSchema.safeParse(parsedJson);
      if (validated.success) {
        content = toTextWithSingleAction(validated.data);
      } else {
        // Fallback: attempt to sanitize a free-text response into a single ACTION
        const lines = raw.split(/\r?\n/);
        let firstAction: { verb: string; target: string } | null = null;
        const nonAction: string[] = [];
        for (const line of lines) {
          const m = /^ACTION\s+([^\s:]+)\s*[:\-]?\s*(.+)$/i.exec(line.trim());
          if (m && !firstAction) {
            const v = (m[1] || '').toUpperCase();
            let t = (m[2] || '').trim();
            if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")) || (t.startsWith('`') && t.endsWith('`'))) t = t.slice(1, -1);
            const ok = ActionSchema.safeParse({ verb: v, target: t });
            if (ok.success) firstAction = ok.data;
          } else if (!/^ACTION\b/i.test(line.trim())) {
            nonAction.push(line);
          }
        }
        if (firstAction) {
          content = `${nonAction.join('\n').trim()}\nACTION ${firstAction.verb} ${firstAction.target}`.trim();
        } else {
          // As a last resort, return the raw text (no ACTION)
          content = raw.trim();
        }
      }
    } catch {
      // Not JSON; sanitize to ensure at most one action
      const lines = raw.split(/\r?\n/);
      let firstAction: { verb: string; target: string } | null = null;
      const nonAction: string[] = [];
      for (const line of lines) {
        const m = /^ACTION\s+([^\s:]+)\s*[:\-]?\s*(.+)$/i.exec(line.trim());
        if (m && !firstAction) {
          const v = (m[1] || '').toUpperCase();
          let t = (m[2] || '').trim();
          if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")) || (t.startsWith('`') && t.endsWith('`'))) t = t.slice(1, -1);
          const ok = ActionSchema.safeParse({ verb: v, target: t });
          if (ok.success) firstAction = ok.data;
        } else if (!/^ACTION\b/i.test(line.trim())) {
          nonAction.push(line);
        }
      }
      if (firstAction) {
        content = `${nonAction.join('\n').trim()}\nACTION ${firstAction.verb} ${firstAction.target}`.trim();
      } else {
        content = raw.trim();
      }
    }
    return res.status(200).json({ content });
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
