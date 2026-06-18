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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Settings2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

function getDifficultyColor(d: string) {
  if (d === 'easy') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (d === 'medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
}

function stripHtml(html: string) {
  if (!html) return '';
  let text = html.replace(/<\/(p|div|h[1-6]|li|ul|ol|table|tr|blockquote)>/gi, ' ');
  text = text.replace(/<(br|hr)[^>]*>/gi, ' ');
  text = text.replace(/<[^>]+>/g, '');
  return text.replace(/\s+/g, ' ').trim();
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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [ttsSpeed, setTtsSpeed] = useState<number>(1);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const synth = window.speechSynthesis;
      synthRef.current = synth;

      const loadVoices = () => {
        const availableVoices = synth.getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
          
          // Try to auto-select a good female voice if none is selected
          const savedURI = localStorage.getItem('q-tts-voice');
          if (savedURI && availableVoices.some(v => v.voiceURI === savedURI)) {
            setSelectedVoiceURI(savedURI);
          } else {
            const sweetVoice = availableVoices.find(v => 
              v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Google UK English Female')
            );
            setSelectedVoiceURI(sweetVoice ? sweetVoice.voiceURI : availableVoices[0]?.voiceURI || '');
          }
        }
      };

      loadVoices();
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices;
      }
    }

    // Restore font size from localStorage
    const savedFs = localStorage.getItem('q-font-size');
    if (savedFs !== null) setFontSizeIdx(Number(savedFs));

    // Restore speed
    const savedSpeed = localStorage.getItem('q-tts-speed');
    if (savedSpeed !== null) setTtsSpeed(Number(savedSpeed));

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
    
    // Apply user settings
    utterance.rate = ttsSpeed;
    if (selectedVoiceURI) {
      const voice = voices.find(v => v.voiceURI === selectedVoiceURI);
      if (voice) utterance.voice = voice;
    }
    
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
            
            {/* TTS Settings */}
            <Dialog>
              <DialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20 ml-1 border-l border-border/50 rounded-none pl-2" title="Voice Settings" />}>
                <Settings2 className="w-4 h-4" />
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Voice Settings</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reading Speed</label>
                    <Select 
                      value={ttsSpeed.toString()} 
                      onValueChange={(v) => {
                        if (v) {
                          const num = Number(v);
                          setTtsSpeed(num);
                          localStorage.setItem('q-tts-speed', v);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select speed" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.75">Slow (0.75x)</SelectItem>
                        <SelectItem value="1">Medium (1.0x)</SelectItem>
                        <SelectItem value="1.25">High (1.25x)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Voice (Boy/Girl)</label>
                    <Select 
                      value={selectedVoiceURI} 
                      onValueChange={(v) => {
                        if(v) {
                          setSelectedVoiceURI(v);
                          localStorage.setItem('q-tts-voice', v);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a voice" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {voices.map(v => (
                          <SelectItem key={v.voiceURI} value={v.voiceURI}>
                            {v.name} ({v.lang})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
                className="group relative rounded-2xl border border-border/40 bg-card/40 hover:bg-card/60 backdrop-blur-md hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 animate-fade-in overflow-hidden flex flex-col"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {/* Top Difficulty Accent */}
                <div className={`h-1 w-full absolute top-0 left-0 transition-opacity opacity-50 group-hover:opacity-100 ${
                  q.difficulty === 'easy' ? 'bg-gradient-to-r from-emerald-500/80 to-transparent' :
                  q.difficulty === 'medium' ? 'bg-gradient-to-r from-amber-500/80 to-transparent' : 'bg-gradient-to-r from-red-500/80 to-transparent'
                }`} />

                <div className="flex-1 p-5 sm:p-6 flex flex-col">
                  {/* Header row: Categories & Difficulty */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                     <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold border-primary/30 text-primary bg-primary/5">
                          {q.category}
                        </Badge>
                        <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full border font-semibold tracking-wide uppercase ${getDifficultyColor(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                     </div>
                     
                     <div className="flex items-center gap-1 shrink-0">
                        {/* Action buttons */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-yellow-400/10"
                          onClick={(e) => handleToggleFavorite(q, e)}
                          title="Favorite"
                        >
                          <Star className={`w-3.5 h-3.5 transition-colors ${q.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 rounded-full transition-colors ${isPlaying ? 'bg-primary/20 hover:bg-primary/30' : 'hover:bg-primary/10'}`}
                          onClick={(e) => handleSpeak(q, e)}
                          title={isPlaying ? 'Stop reading' : 'Read aloud'}
                        >
                          {isPlaying ? (
                            <VolumeX className="w-3.5 h-3.5 text-primary animate-pulse" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </Button>
                     </div>
                  </div>

                  {/* Question */}
                  <Link href={`/questions/${q.id}`} className="block mb-2 group-hover:text-primary transition-colors">
                    <h3 className={`font-bold leading-snug text-foreground ${fs.questionSize}`}>
                      {q.question}
                    </h3>
                  </Link>

                  {/* Answer full view */}
                  <div className="mb-4 flex-1 overflow-hidden relative">
                    <div className="max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      <div
                        className={`prose dark:prose-invert max-w-none answer-prose text-muted-foreground/90 ${
                          fs.answerSize === 'text-xs' || fs.answerSize === 'text-sm' ? 'prose-sm' : 'prose-base'
                        }`}
                        dangerouslySetInnerHTML={{ __html: q.answer }}
                      />
                    </div>
                  </div>

                  {/* Footer: Tags and Edit/Delete/View */}
                  <div className="flex items-end justify-between gap-3 mt-auto pt-4 border-t border-border/30">
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {q.tags.map((tag) => (
                        <span key={tag} className="text-[10px] sm:text-xs text-muted-foreground/70 bg-secondary/50 px-2 py-1 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/questions/${q.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-blue-400 rounded-lg">
                          <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">View</span>
                        </Button>
                      </Link>
                      <Link href={`/questions/${q.id}/edit`}>
                        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-primary rounded-lg">
                          <Pencil className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Edit</span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(q.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Playing indicator bar */}
                {isPlaying && (
                  <div className="h-0.5 w-full bg-gradient-to-r from-primary via-purple-400 to-primary bg-[length:200%_100%] animate-pulse absolute bottom-0 left-0" />
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
