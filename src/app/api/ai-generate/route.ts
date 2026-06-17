import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { question, context } = await req.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please add your GEMINI_API_KEY to .env.local and restart the server.' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey.trim());

    // Use correct model names for Gemini free API
    const modelNames = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-pro',
    ];
    let answer = '';
    let lastError: unknown = null;

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `You are an expert interview coach. Provide a clear, concise, and professional answer to the following interview question.

Interview Question: "${question}"

${context ? `Additional Context: ${context}` : ''}

Guidelines:
- Give a structured, well-organized answer
- Include practical examples where relevant
- Keep the answer comprehensive but concise (3-5 paragraphs)
- Use simple language that is easy to understand
- Format with bullet points or numbered lists where appropriate

Provide the answer directly without any preamble like "Here is the answer:" or "Sure!".`;

        const result = await model.generateContent(prompt);
        answer = result.response.text();
        break; // success — stop trying
      } catch (e) {
        lastError = e;
        continue; // try next model
      }
    }

    if (!answer) {
      const errMsg = lastError instanceof Error ? lastError.message : String(lastError);
      console.error('All Gemini models failed:', errMsg);
      return NextResponse.json(
        { error: `Gemini API error: ${errMsg}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ answer });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Gemini route error:', errMsg);
    return NextResponse.json(
      { error: `Failed to generate answer: ${errMsg}` },
      { status: 500 }
    );
  }
}
