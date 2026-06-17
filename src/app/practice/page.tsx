'use client';

import { useState, useEffect, useCallback } from 'react';
import { Question, CATEGORIES } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Shuffle,
  RotateCcw,
  Trophy,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';

function getDifficultyColor(d: string) {
  if (d === 'easy') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (d === 'medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
}

export default function PracticePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filtered, setFiltered] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('all');
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/questions');
      const data = await res.json();
      setQuestions(data);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    let result = [...questions];
    if (category !== 'All') result = result.filter((q) => q.category === category);
    if (difficulty !== 'all') result = result.filter((q) => q.difficulty === difficulty);
    setFiltered(result);
    setCurrent(0);
    setShowAnswer(false);
    setDone(false);
  }, [questions, category, difficulty]);

  const shuffle = () => {
    const arr = [...filtered].sort(() => Math.random() - 0.5);
    setFiltered(arr);
    setCurrent(0);
    setShowAnswer(false);
    setDone(false);
    toast.success('Questions shuffled!');
  };

  const reset = () => {
    setCurrent(0);
    setShowAnswer(false);
    setDone(false);
  };

  const next = () => {
    if (current === filtered.length - 1) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setShowAnswer(false);
    }
  };

  const prev = () => {
    if (current > 0) {
      setCurrent((c) => c - 1);
      setShowAnswer(false);
    }
  };

  const q = filtered[current];
  const progress = filtered.length ? ((current + 1) / filtered.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading practice questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Practice Mode</h1>
            <p className="text-sm text-muted-foreground">Flashcard-style interview practice</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 animate-fade-in" style={{ animationDelay: '60ms' }}>
        <Select value={category} onValueChange={(v) => v && setCategory(v)}>
          <SelectTrigger className="w-40 bg-card border-border/50">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={(v) => v && setDifficulty(v)}>
          <SelectTrigger className="w-36 bg-card border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={shuffle} className="gap-2">
          <Shuffle className="w-4 h-4" /> Shuffle
        </Button>
        <Button variant="ghost" onClick={reset} className="gap-2">
          <RotateCcw className="w-4 h-4" /> Reset
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="glass-card border-border/50">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No questions found</h3>
            <p className="text-sm text-muted-foreground">
              Try different filters or add more questions
            </p>
          </CardContent>
        </Card>
      ) : done ? (
        <Card className="glass-card border-primary/20 animate-fade-in">
          <CardContent className="p-12 text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold gradient-text mb-2">Practice Complete! 🎉</h2>
            <p className="text-muted-foreground mb-6">
              You've reviewed all {filtered.length} questions
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={reset} className="gap-2">
                <RotateCcw className="w-4 h-4" /> Start Again
              </Button>
              <Button onClick={shuffle} className="gap-2">
                <Shuffle className="w-4 h-4" /> Shuffle & Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Question {current + 1} of {filtered.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {/* Question Card */}
          <Card className="glass-card border-primary/20 animate-fade-in" key={q.id + '-q'}>
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                  {q.category}
                </Badge>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(q.difficulty)}`}>
                  {q.difficulty}
                </span>
                {q.isFavorite && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
              </div>
              <p className="text-base sm:text-lg font-semibold leading-relaxed">
                {q.question}
              </p>
            </CardContent>
          </Card>

          {/* Show/Hide Answer */}
          <div className="text-center">
            <Button
              variant={showAnswer ? 'outline' : 'default'}
              onClick={() => setShowAnswer(!showAnswer)}
              className="gap-2 px-8"
              size="lg"
            >
              {showAnswer ? (
                <><EyeOff className="w-4 h-4" /> Hide Answer</>
              ) : (
                <><Eye className="w-4 h-4" /> Reveal Answer</>
              )}
            </Button>
          </div>

          {/* Answer Card */}
          {showAnswer && (
            <Card className="glass-card border-emerald-500/20 animate-fade-in" key={q.id + '-a'}>
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-emerald-400 font-bold text-xs">A</span>
                  </div>
                  <span className="text-xs font-medium text-emerald-400">Answer</span>
                </div>
                <div className="answer-prose text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed">
                  {q.answer}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-2 pb-8">
            <Button
              variant="outline"
              onClick={prev}
              disabled={current === 0}
              className="gap-2 flex-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <Button onClick={next} className="gap-2 flex-1 shadow-lg shadow-primary/20">
              {current === filtered.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
