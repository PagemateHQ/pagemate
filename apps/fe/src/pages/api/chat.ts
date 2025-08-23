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

    const completion = await openai.chat.completions.create({
      model: model || 'solar-pro2',
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
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

