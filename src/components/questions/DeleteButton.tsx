'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@/types';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
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
import { toast } from 'sonner';

export function DeleteButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      toast.success('Question deleted');
      router.push('/questions');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="w-4 h-4" /> Delete
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
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
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
