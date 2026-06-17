import { getQuestionById } from '@/lib/data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Pencil, Star, Calendar, Tag } from 'lucide-react';
import { DeleteButton } from '@/components/questions/DeleteButton';
import { FavoriteButton } from '@/components/questions/FavoriteButton';

function getDifficultyColor(d: string) {
  if (d === 'easy') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (d === 'medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
}

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const question = getQuestionById(id);

  if (!question) notFound();

  const createdDate = new Date(question.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-3xl mx-auto">
      {/* Back + Actions */}
      <div className="flex items-center justify-between gap-3 mb-6 animate-fade-in">
        <Link href="/questions">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
        <div className="flex gap-2">
          <FavoriteButton question={question} />
          <Link href={`/questions/${id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Pencil className="w-4 h-4" /> Edit
            </Button>
          </Link>
          <DeleteButton id={id} />
        </div>
      </div>

      {/* Meta badges */}
      <div className="flex flex-wrap items-center gap-2 mb-5 animate-fade-in" style={{ animationDelay: '60ms' }}>
        <Badge variant="outline" className="border-primary/40 text-primary">
          {question.category}
        </Badge>
        <span className={`text-xs px-2.5 py-1 rounded-full border ${getDifficultyColor(question.difficulty)}`}>
          {question.difficulty}
        </span>
        {question.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 text-xs">
            <Tag className="w-2.5 h-2.5" />#{tag}
          </Badge>
        ))}
        <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
          <Calendar className="w-3 h-3" /> {createdDate}
        </span>
      </div>

      {/* Question Card */}
      <Card className="glass-card border-primary/20 mb-5 animate-fade-in" style={{ animationDelay: '90ms' }}>
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary font-bold text-sm">Q</span>
            </div>
            <p className="text-base sm:text-lg font-semibold leading-relaxed">
              {question.question}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Answer Card */}
      <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '120ms' }}>
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-emerald-400 font-bold text-sm">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="answer-prose text-foreground/90 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: question.answer
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/`(.*?)`/g, '<code>$1</code>')
                    .replace(/^- (.*)/gm, '<li>$1</li>')
                    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>'),
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation between questions */}
      <div className="mt-8 pb-8">
        <Link href="/questions">
          <Button variant="outline" className="w-full">
            ← Back to All Questions
          </Button>
        </Link>
      </div>
    </div>
  );
}
