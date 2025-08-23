import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'solar-pro2', pageHtml = '', ragContext = '' } = await request.json();

    // Here you would integrate with your actual chat/LLM service
    // For now, returning a mock response
    const mockResponse = {
      content: "I'm here to help you with your tenant insurance questions. How can I assist you today?",
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}