import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

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
      'Your purpose is to help users complete tasks with smart guidance and optional automation (Autopilot).',
      'Interpret imperative requests as UI actions when possible (click, highlight, navigate, fill forms).',
      'If the user says "highlight <text>", they mean visually highlight the on-page element — do NOT format text as bold/italics.',
      'When you want to request a UI action, include a single directive line in your response: ACTION <VERB> <TARGET>.',
        'Supported VERB values: SPOTLIGHT (highlight by visible text), CLICK (click by visible text), SPOTLIGHT_XPATH (highlight by XPath), CLICK_XPATH (click by XPath), RETRIEVE (semantic search).',
        'Use RETRIEVE when external knowledge is needed. Provide a concise query; the client will fetch top matches and continue the answer using them.',
        'When multiple components share the same visible text, include a precise XPath TARGET to disambiguate (e.g., indexed or attribute-constrained XPath).',
        'Examples: ACTION SPOTLIGHT Start Building | ACTION CLICK "Start Building" | ACTION CLICK_XPATH //button[normalize-space()="Start Building"][2] | ACTION SPOTLIGHT_XPATH //div[@id=\'hero\'] | ACTION RETRIEVE refund policy for subscriptions',
      'Keep replies concise and confirm actions you take (e.g., "Highlighting Start Building").',
      'When uncertain, ask a short clarifying question. Do not hallucinate UI that is not present.',
      'Never use bold text in your response. Do not quote commands in your response; commands should not show up in your response unless they are being executed.',
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

    const completion = await openai.chat.completions.create({
      model: model || 'solar-pro2',
      messages: finalMessages,
      stream: false,
    });

    const content = completion.choices?.[0]?.message?.content ?? '';
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
