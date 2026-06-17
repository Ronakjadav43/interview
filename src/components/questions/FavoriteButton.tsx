'use client';

import { useState } from 'react';
import { Question } from '@/types';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function FavoriteButton({ question }: { question: Question }) {
  const [isFav, setIsFav] = useState(question.isFavorite);
  const router = useRouter();

  const toggle = async () => {
    try {
      await fetch(`/api/questions/${question.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !isFav }),
      });
      setIsFav(!isFav);
      toast.success(isFav ? 'Removed from favorites' : 'Added to favorites');
      router.refresh();
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      className={`gap-2 ${isFav ? 'border-yellow-500/40 text-yellow-400 hover:bg-yellow-400/10' : ''}`}
    >
      <Star className={`w-4 h-4 ${isFav ? 'fill-yellow-400 text-yellow-400' : ''}`} />
      {isFav ? 'Favorited' : 'Favorite'}
    </Button>
  );
}
