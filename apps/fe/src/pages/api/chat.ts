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

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.UPSTAGE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!apiKey && !openaiKey) {
    return res.status(500).json({ error: 'Missing UPSTAGE_API_KEY or OPENAI_API_KEY' });
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

    const upstageClient = apiKey
      ? new OpenAI({ apiKey, baseURL: 'https://api.upstage.ai/v1' })
      : null;

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
    const isOpenAIModel = /^gpt-|^o3|^gpt4|^gpt-4o/i.test(mname);

    if (openaiKey && isOpenAIModel) {
      const oai = new OpenAI({ apiKey: openaiKey });
      try {
        const completion: any = await oai.chat.completions.parse({
          model: mname,
          messages: finalMessages,
          response_format: zodResponseFormat(AssistantSchema, 'assistant_reply'),
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
      } catch (e: any) {
        if (!upstageClient) throw e;
        const completion = await upstageClient.chat.completions.create({
          model: 'solar-pro2',
          messages: finalMessages,
          stream: false,
        });
        const raw = completion.choices?.[0]?.message?.content ?? '';
        ({ content, structured } = locallyValidateOrSanitize(raw));
      }
    } else {
      if (!upstageClient) {
        return res.status(500).json({ error: 'No suitable provider configured' });
      }
      const completion = await upstageClient.chat.completions.create({
        model: mname || 'solar-pro2',
        messages: finalMessages,
        stream: false,
      });
      const raw = completion.choices?.[0]?.message?.content ?? '';
      ({ content, structured } = locallyValidateOrSanitize(raw));
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
