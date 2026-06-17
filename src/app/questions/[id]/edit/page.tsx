'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Question, CATEGORIES, DIFFICULTIES } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X, Save, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    question: '',
    answer: '',
    category: 'General',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetch(`/api/questions/${id}`)
        .then((r) => r.json())
        .then((data: Question) => {
          setForm({
            question: data.question,
            answer: data.answer,
            category: data.category,
            difficulty: data.difficulty,
            tags: data.tags,
          });
        })
        .catch(() => toast.error('Failed to load question'))
        .finally(() => setFetching(false));
    });
  }, [params]);

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  };

  const handleAIGenerate = async () => {
    if (!form.question.trim()) {
      toast.error('Please enter a question first');
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: form.question }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setForm((f) => ({ ...f, answer: data.answer }));
        toast.success('AI answer generated!');
      }
    } catch {
      toast.error('Failed to generate answer');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success('Question updated!');
      router.push(`/questions/${id}`);
    } catch {
      toast.error('Failed to update question');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-3xl mx-auto space-y-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <Link href={`/questions/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold gradient-text">Edit Question</h1>
          <p className="text-sm text-muted-foreground">Update your interview Q&A</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Interview Question *</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Textarea
              placeholder="Enter your interview question..."
              value={form.question}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              rows={3}
              className="bg-secondary/50 border-border/50 resize-none"
              required
            />
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Answer *</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAIGenerate}
                disabled={aiLoading}
                className="gap-2 text-xs border-primary/30 text-primary hover:bg-primary/10"
              >
                <Sparkles className="w-3 h-3" />
                {aiLoading ? 'Generating...' : 'AI Regenerate'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Textarea
              placeholder="Write or paste your answer here..."
              value={form.answer}
              onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
              rows={8}
              className="bg-secondary/50 border-border/50 resize-none"
              required
            />
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Category & Difficulty</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Category</label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger className="bg-secondary/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Difficulty</label>
                <Select
                  value={form.difficulty}
                  onValueChange={(v) => setForm((f) => ({ ...f, difficulty: v as any }))}
                >
                  <SelectTrigger className="bg-secondary/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Tags</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addTag(); }
                }}
                className="bg-secondary/50 border-border/50"
              />
              <Button type="button" variant="outline" size="icon" onClick={addTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/20" onClick={() => removeTag(tag)}>
                    #{tag} <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3 pb-8">
          <Link href={`/questions/${id}`} className="flex-1">
            <Button type="button" variant="outline" className="w-full">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading} className="flex-1 gap-2 shadow-lg shadow-primary/20">
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
