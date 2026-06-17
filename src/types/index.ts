export interface Question {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AboutData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  links: {
    github: string;
    linkedin: string;
    portfolio: string;
  };
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  year: string;
}

export const CATEGORIES = [
  'All',
  'React',
  'JavaScript',
  'TypeScript',
  'Node.js',
  'Next.js',
  'CSS',
  'HTML',
  'DSA',
  'System Design',
  'Database',
  'Git',
  'HR',
  'General',
  'Python',
  'Other',
] as const;

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
