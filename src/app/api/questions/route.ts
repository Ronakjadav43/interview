import { NextRequest, NextResponse } from 'next/server';
import { getQuestions, createQuestion } from '@/lib/data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const favorites = searchParams.get('favorites');

    let questions = getQuestions();

    if (category && category !== 'All') {
      questions = questions.filter((q) => q.category === category);
    }
    if (difficulty && difficulty !== 'all') {
      questions = questions.filter((q) => q.difficulty === difficulty);
    }
    if (favorites === 'true') {
      questions = questions.filter((q) => q.isFavorite);
    }
    if (search) {
      const s = search.toLowerCase();
      questions = questions.filter(
        (q) =>
          q.question.toLowerCase().includes(s) ||
          q.answer.toLowerCase().includes(s) ||
          q.tags.some((t) => t.toLowerCase().includes(s))
      );
    }

    return NextResponse.json(questions);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, answer, category, tags, difficulty } = body;

    if (!question || !answer || !category) {
      return NextResponse.json(
        { error: 'Question, answer and category are required' },
        { status: 400 }
      );
    }

    const newQuestion = createQuestion({
      question,
      answer,
      category,
      tags: tags || [],
      difficulty: difficulty || 'medium',
      isFavorite: false,
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}
