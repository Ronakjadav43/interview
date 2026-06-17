'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Question, CATEGORIES, DIFFICULTIES } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Search,
  Star,
  Pencil,
  Trash2,
  Eye,
  MessageSquare,
  X,
  Volume2,
  VolumeX,
  AArrowUp,
  AArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

function getDifficultyColor(d: string) {
  if (d === 'easy') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (d === 'medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
}

const FONT_SIZES = [
  { label: 'S', questionSize: 'text-sm', answerSize: 'text-xs' },
  { label: 'M', questionSize: 'text-base', answerSize: 'text-sm' },
  { label: 'L', questionSize: 'text-lg', answerSize: 'text-base' },
  { label: 'XL', questionSize: 'text-xl', answerSize: 'text-lg' },
];

import { Suspense } from 'react';

function QuestionsContent() {
  const searchParams = useSearchParams();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [difficulty, setDifficulty] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [fontSizeIdx, setFontSizeIdx] = useState(1); // default M
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    // Restore font size from localStorage
    const saved = localStorage.getItem('q-font-size');
    if (saved !== null) setFontSizeIdx(Number(saved));
    return () => {
      synthRef.current?.cancel();
    };
  }, []);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category && category !== 'All') params.set('category', category);
      if (difficulty && difficulty !== 'all') params.set('difficulty', difficulty);
      if (favoritesOnly) params.set('favorites', 'true');

      const res = await fetch(`/api/questions?${params.toString()}`);
      const data = await res.json();
      setQuestions(data);
    } catch {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [search, category, difficulty, favoritesOnly]);

  useEffect(() => {
    const timer = setTimeout(fetchQuestions, 300);
    return () => clearTimeout(timer);
  }, [fetchQuestions]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      toast.success('Question deleted');
      setDeleteId(null);
      fetchQuestions();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleToggleFavorite = async (q: Question, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await fetch(`/api/questions/${q.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFavorite: !q.isFavorite }),
    });
    fetchQuestions();
  };

  const handleSpeak = (q: Question, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const synth = synthRef.current;
    if (!synth) return;

    if (speakingId === q.id) {
      synth.cancel();
      setSpeakingId(null);
      return;
    }

    synth.cancel();
    const text = `Question: ${q.question}. Answer: ${q.answer}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.lang = 'en-US';
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(q.id);
    synth.speak(utterance);
  };

  const changeFontSize = (dir: 1 | -1) => {
    setFontSizeIdx((prev) => {
      const next = Math.max(0, Math.min(FONT_SIZES.length - 1, prev + dir));
      localStorage.setItem('q-font-size', String(next));
      return next;
    });
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setDifficulty('all');
    setFavoritesOnly(false);
  };

  const hasFilters = search || category !== 'All' || difficulty !== 'all' || favoritesOnly;
  const fs = FONT_SIZES[fontSizeIdx];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-primary" />
            All Questions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {questions.length} questions found
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Font size controls */}
          <div className="flex items-center gap-1 bg-secondary/60 rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/20"
              onClick={() => changeFontSize(-1)}
              disabled={fontSizeIdx === 0}
              title="Decrease font size"
            >
              <AArrowDown className="w-4 h-4" />
            </Button>
            <span className="text-xs font-semibold text-muted-foreground px-1 min-w-[20px] text-center">
              {fs.label}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/20"
              onClick={() => changeFontSize(1)}
              disabled={fontSizeIdx === FONT_SIZES.length - 1}
              title="Increase font size"
            >
              <AArrowUp className="w-4 h-4" />
            </Button>
          </div>
          <Link href="/questions/new">
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" /> Add Question
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 rounded-xl bg-card/60 border border-border/40 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search questions or answers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/50 border-border/50"
          />
        </div>
        <Select value={category} onValueChange={(v) => v && setCategory(v)}>
          <SelectTrigger className="w-full sm:w-44 bg-secondary/50 border-border/50">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={(v) => v && setDifficulty(v)}>
          <SelectTrigger className="w-full sm:w-36 bg-secondary/50 border-border/50">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {DIFFICULTIES.map((d) => (
              <SelectItem key={d} value={d}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={favoritesOnly ? 'default' : 'outline'}
          size="icon"
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          title="Favorites only"
          className="shrink-0"
        >
          <Star className={`w-4 h-4 ${favoritesOnly ? 'fill-current' : ''}`} />
        </Button>
        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters" className="shrink-0">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-border/40 p-5 bg-card/60">
              <Skeleton className="h-5 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-2xl border border-border/40 p-12 text-center bg-card/60">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No questions found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {hasFilters ? 'Try adjusting your filters' : 'Start by adding your first question'}
          </p>
          {hasFilters ? (
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          ) : (
            <Link href="/questions/new">
              <Button><Plus className="w-4 h-4 mr-2" /> Add Question</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, i) => {
            const isPlaying = speakingId === q.id;
            return (
              <div
                key={q.id}
                className="group rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 animate-fade-in overflow-hidden"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {/* Colored left accent bar */}
                <div className="flex">
                  <div className={`w-1 shrink-0 ${
                    q.difficulty === 'easy' ? 'bg-emerald-500' :
                    q.difficulty === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  <div className="flex-1 p-4 sm:p-5">
                    {/* Question */}
                    <p className={`font-semibold leading-snug text-foreground mb-2 ${fs.questionSize}`}>
                      {q.question}
                    </p>

                    {/* Answer preview */}
                    <p className={`text-muted-foreground leading-relaxed line-clamp-3 mb-3 ${fs.answerSize}`}>
                      {q.answer}
                    </p>

                    {/* Tags row + Actions */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs border-primary/40 text-primary font-medium">
                          {q.category}
                        </Badge>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getDifficultyColor(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                        {q.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs opacity-80">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        {/* Favorite */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl hover:bg-yellow-400/10"
                          onClick={(e) => handleToggleFavorite(q, e)}
                          title="Favorite"
                        >
                          <Star className={`w-4 h-4 transition-colors ${q.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                        </Button>

                        {/* Speaker / TTS */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-9 w-9 rounded-xl transition-colors ${isPlaying ? 'bg-primary/20 hover:bg-primary/30' : 'hover:bg-primary/10'}`}
                          onClick={(e) => handleSpeak(q, e)}
                          title={isPlaying ? 'Stop reading' : 'Read aloud (Q + A)'}
                        >
                          {isPlaying ? (
                            <VolumeX className="w-4 h-4 text-primary animate-pulse" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                          )}
                        </Button>

                        {/* View */}
                        <Link href={`/questions/${q.id}`}>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-blue-500/10" title="View">
                            <Eye className="w-4 h-4 text-muted-foreground hover:text-blue-400 transition-colors" />
                          </Button>
                        </Link>

                        {/* Edit */}
                        <Link href={`/questions/${q.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10" title="Edit">
                            <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                          </Button>
                        </Link>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl hover:bg-destructive/10"
                          onClick={() => setDeleteId(q.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Playing indicator bar */}
                {isPlaying && (
                  <div className="h-0.5 bg-gradient-to-r from-primary via-purple-400 to-primary bg-[length:200%_100%] animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The question will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <QuestionsContent />
    </Suspense>
  );
}
