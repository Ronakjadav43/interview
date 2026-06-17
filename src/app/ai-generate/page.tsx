'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Save, Copy, RefreshCw, Brain, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { CATEGORIES, DIFFICULTIES } from '@/types';
import { useRouter } from 'next/navigation';

export default function AIGeneratePage() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('General');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sampleQuestions = [
    'What is the difference between let, const, and var in JavaScript?',
    'Explain the concept of promises and async/await.',
    'What is the virtual DOM in React?',
    'What are the SOLID principles?',
    'Explain REST API design principles.',
    'What is time complexity and space complexity?',
    'Tell me about a challenging project you worked on.',
    'What is your greatest weakness?',
  ];

  const generateAnswer = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }
    setLoading(true);
    setAnswer('');
    try {
      const res = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setAnswer(data.answer);
        toast.success('Answer generated!');
      }
    } catch {
      toast.error('Failed to generate answer');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(answer);
    toast.success('Copied to clipboard!');
  };

  const saveToCollection = async () => {
    if (!question.trim() || !answer.trim()) {
      toast.error('Generate an answer first');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          answer,
          category,
          difficulty,
          tags: ['ai-generated'],
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Saved to your collection!');
      router.push('/questions');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center animate-pulse-glow">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">AI Answer Generator</h1>
            <p className="text-sm text-muted-foreground">Powered by Google Gemini</p>
          </div>
        </div>
      </div>

      {/* Sample Questions */}
      <Card className="glass-card border-border/50 mb-6 animate-fade-in" style={{ animationDelay: '60ms' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            Sample Questions (click to use)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((q) => (
              <Badge
                key={q}
                variant="secondary"
                className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors text-xs py-1 px-2"
                onClick={() => setQuestion(q)}
              >
                {q.length > 50 ? q.slice(0, 50) + '...' : q}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Question Input */}
      <Card className="glass-card border-border/50 mb-4 animate-fade-in" style={{ animationDelay: '90ms' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Your Question</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <Textarea
            placeholder="Type your interview question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            className="bg-secondary/50 border-border/50 resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Category</label>
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger className="bg-secondary/50 border-border/50 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Difficulty</label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
                <SelectTrigger className="bg-secondary/50 border-border/50 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d} value={d} className="text-xs">
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={generateAnswer}
            disabled={loading}
            className="w-full gap-2 shadow-lg shadow-primary/20"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating with Gemini AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Answer
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Answer */}
      {(answer || loading) && (
        <Card className="glass-card border-primary/20 animate-fade-in">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                AI Generated Answer
              </CardTitle>
              {answer && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="gap-1 text-xs"
                >
                  <Copy className="w-3 h-3" /> Copy
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-2">
                <div className="h-3 bg-primary/20 rounded animate-pulse w-full" />
                <div className="h-3 bg-primary/20 rounded animate-pulse w-4/5" />
                <div className="h-3 bg-primary/20 rounded animate-pulse w-full" />
                <div className="h-3 bg-primary/20 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-primary/20 rounded animate-pulse w-full" />
              </div>
            ) : (
              <>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={10}
                  className="bg-secondary/50 border-border/50 resize-none text-sm answer-prose mb-4"
                />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={generateAnswer}
                    className="gap-2 flex-1"
                    disabled={loading}
                  >
                    <RefreshCw className="w-4 h-4" /> Regenerate
                  </Button>
                  <Button
                    onClick={saveToCollection}
                    disabled={saving}
                    className="gap-2 flex-1 shadow-lg shadow-primary/20"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save to Collection'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
