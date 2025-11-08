import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, userAnswer, correctAnswer, options } = body;

    if (!question || !correctAnswer) {
      return NextResponse.json(
        { error: 'Question and correct answer are required' },
        { status: 400 }
      );
    }

    // Call OpenRouter API for AI-powered explanation
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1',
        messages: [
          {
            role: 'system',
            content: 'You are an expert English grammar teacher. Provide clear, concise explanations for grammar questions. Keep explanations under 3 sentences and focus on the key grammar rule.'
          },
          {
            role: 'user',
            content: `Question: ${question}\n\nUser's Answer: ${userAnswer || 'No answer'}\nCorrect Answer: ${correctAnswer}\n\nOptions:\n${Object.entries(options || {}).map(([key, value]) => `${key}. ${value}`).join('\n')}\n\nPlease explain why "${correctAnswer}" is correct and provide a brief grammar rule or tip.`
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!openRouterResponse.ok) {
      console.error('OpenRouter API error:', await openRouterResponse.text());
      return NextResponse.json(
        { error: 'Failed to generate AI explanation' },
        { status: 500 }
      );
    }

    const openRouterData = await openRouterResponse.json();
    const aiExplanation = openRouterData.choices[0]?.message?.content || 'Explanation not available.';

    return NextResponse.json({
      ok: true,
      explanation: aiExplanation,
    });
  } catch (error) {
    console.error('AI Explanation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
