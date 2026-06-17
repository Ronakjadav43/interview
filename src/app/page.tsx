import { getQuestions } from '@/lib/data';
import { CATEGORIES } from '@/types';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Star,
  Brain,
  TrendingUp,
  Plus,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Target,
} from 'lucide-react';
import { Question } from '@/types';

function getDifficultyColor(d: string) {
  if (d === 'easy') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (d === 'medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
}

function getCategoryStats(questions: Question[]) {
  const stats: Record<string, number> = {};
  questions.forEach((q) => {
    stats[q.category] = (stats[q.category] || 0) + 1;
  });
  return Object.entries(stats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);
}

export default function DashboardPage() {
  const questions = getQuestions();
  const favorites = questions.filter((q) => q.isFavorite);
  const easy = questions.filter((q) => q.difficulty === 'easy');
  const medium = questions.filter((q) => q.difficulty === 'medium');
  const hard = questions.filter((q) => q.difficulty === 'hard');
  const recent = questions.slice(0, 5);
  const categoryStats = getCategoryStats(questions);

  const stats = [
    {
      label: 'Total Questions',
      value: questions.length,
      icon: MessageSquare,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Favorites',
      value: favorites.length,
      icon: Star,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
    },
    {
      label: 'Easy',
      value: easy.length,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
    },
    {
      label: 'Hard',
      value: hard.length,
      icon: Target,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
    },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back! Ready to ace your interview? 🚀
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="glass-card border-border/50 hover:border-primary/30 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Questions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Recent Questions
            </h2>
            <Link href="/questions">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View All <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>

          {recent.length === 0 ? (
            <Card className="glass-card border-border/50">
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No questions yet.</p>
                <Link href="/questions/new">
                  <Button className="mt-4" size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Add First Question
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recent.map((q, i) => (
                <Link key={q.id} href={`/questions/${q.id}`}>
                  <Card
                    className="glass-card border-border/50 hover:border-primary/40 transition-all duration-200 cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2 mb-2">
                            {q.question}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                              {q.category}
                            </Badge>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(q.difficulty)}`}
                            >
                              {q.difficulty}
                            </span>
                          </div>
                        </div>
                        {q.isFavorite && (
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Quick Actions + Categories */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <Link href="/questions/new" className="block">
                <Button className="w-full justify-start gap-2" size="sm">
                  <Plus className="w-4 h-4" /> Add Question
                </Button>
              </Link>
              <Link href="/ai-generate" className="block">
                <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                  <Sparkles className="w-4 h-4 text-primary" /> AI Generate
                </Button>
              </Link>
              <Link href="/practice" className="block">
                <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                  <BookOpen className="w-4 h-4 text-emerald-400" /> Practice Mode
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">By Category</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {categoryStats.length === 0 ? (
                <p className="text-xs text-muted-foreground">No data yet</p>
              ) : (
                categoryStats.map(([cat, count]) => (
                  <Link key={cat} href={`/questions?category=${cat}`}>
                    <div className="flex items-center justify-between text-sm py-1.5 hover:text-primary transition-colors cursor-pointer">
                      <span className="text-muted-foreground hover:text-foreground">{cat}</span>
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Difficulty Breakdown */}
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">By Difficulty</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {[
                { label: 'Easy', count: easy.length, color: 'bg-emerald-500' },
                { label: 'Medium', count: medium.length, color: 'bg-amber-500' },
                { label: 'Hard', count: hard.length, color: 'bg-red-500' },
              ].map((d) => (
                <div key={d.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{d.label}</span>
                    <span className="font-medium">{d.count}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${d.color} rounded-full transition-all duration-500`}
                      style={{
                        width: questions.length
                          ? `${(d.count / questions.length) * 100}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
