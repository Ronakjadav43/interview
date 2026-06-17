import fs from 'fs';
import path from 'path';
import { Question, AboutData } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const questionsPath = path.join(process.cwd(), 'data', 'questions.json');
const aboutPath = path.join(process.cwd(), 'data', 'about.json');

// ─── Questions ───────────────────────────────────────────────────────────────

export function getQuestions(): Question[] {
  try {
    const data = fs.readFileSync(questionsPath, 'utf-8');
    return JSON.parse(data) as Question[];
  } catch {
    return [];
  }
}

export function getQuestionById(id: string): Question | null {
  const questions = getQuestions();
  return questions.find((q) => q.id === id) || null;
}

export function createQuestion(
  data: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>
): Question {
  const questions = getQuestions();
  const newQuestion: Question = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  questions.unshift(newQuestion);
  fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2), 'utf-8');
  return newQuestion;
}

export function updateQuestion(
  id: string,
  data: Partial<Omit<Question, 'id' | 'createdAt'>>
): Question | null {
  const questions = getQuestions();
  const index = questions.findIndex((q) => q.id === id);
  if (index === -1) return null;
  questions[index] = {
    ...questions[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2), 'utf-8');
  return questions[index];
}

export function deleteQuestion(id: string): boolean {
  const questions = getQuestions();
  const filtered = questions.filter((q) => q.id !== id);
  if (filtered.length === questions.length) return false;
  fs.writeFileSync(questionsPath, JSON.stringify(filtered, null, 2), 'utf-8');
  return true;
}

// ─── About ───────────────────────────────────────────────────────────────────

export function getAbout(): AboutData {
  try {
    const data = fs.readFileSync(aboutPath, 'utf-8');
    return JSON.parse(data) as AboutData;
  } catch {
    return {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      skills: [],
      experience: [],
      education: [],
      links: { github: '', linkedin: '', portfolio: '' },
    };
  }
}

export function updateAbout(data: AboutData): AboutData {
  fs.writeFileSync(aboutPath, JSON.stringify(data, null, 2), 'utf-8');
  return data;
}
