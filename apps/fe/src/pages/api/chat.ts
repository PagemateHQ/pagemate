import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
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
    const { messages, model }: { messages: ChatMessage[]; model?: string } =
      req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages[] is required' });
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.upstage.ai/v1',
    });

    const DEFAULT_SYSTEM_PROMPT =
      [
        'You are Pagemate, an on-page AI assistant embedded in a website.',
        'Your purpose is to help users complete tasks with smart guidance and optional automation (Autopilot).',
        'Interpret imperative requests as UI actions when possible (click, highlight, navigate, fill forms).',
        'If the user says "highlight <text>", they mean visually highlight the on-page element — do NOT format text as bold/italics.',
        'When you want to request a UI action, include a single directive line in your response: ACTION <VERB> <TARGET>.',
        'Supported VERB values: SPOTLIGHT (to visually highlight a target), CLICK (to click a target).',
        'Example: ACTION SPOTLIGHT Start Building',
        'Keep replies concise and confirm actions you take (e.g., "Highlighting Start Building").',
        'When uncertain, ask a short clarifying question. Do not hallucinate UI that is not present.',
      ].join(' ');

    const finalMessages = (() => {
      const m = messages.map((mm) => ({ role: mm.role, content: mm.content }));
      if (m.length === 0 || m[0].role !== 'system') {
        return [{ role: 'system' as const, content: DEFAULT_SYSTEM_PROMPT }, ...m];
      }
      return m;
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

export const config = {
  api: {
    bodyParser: true,
  },
};
