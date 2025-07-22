'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { deleteTagAction, updateTagAction } from './actions';
import { useState } from 'react';
import { Pencil } from 'lucide-react';

import type { PropsWithChildren } from 'react';

type ButtonProps = React.ComponentProps<typeof Button>;

const RetroButton = ({ children, ...props }: PropsWithChildren<ButtonProps>) => (
    <Button {...props} className="bg-amber-100 border-2 border-foreground rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 text-foreground">
      {children}
    </Button>
);

export default function TagActions({ tagId, tagName }: { tagId: string, tagName: string }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form action for updating a tag
  const updateTagWithId = updateTagAction.bind(null);
  
  // Form action for deleting a tag
  const deleteTagWithId = deleteTagAction.bind(null);

  return (
    <div className="flex gap-2 justify-end">
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <RetroButton size="sm"><Pencil className="h-4 w-4" /></RetroButton>
        </DialogTrigger>
        <DialogContent className="bg-amber-50 border-2 border-foreground">
          <DialogHeader>
            <DialogTitle className="font-serif">Edit Tag Name</DialogTitle>
          </DialogHeader>
          <form action={async (formData) => {
              const result = await updateTagWithId(formData);
              if (result?.success) toast.success(result.success);
              if (result?.error) toast.error(result.error);
              setIsEditDialogOpen(false);
          }}>
            <input type="hidden" name="tagId" value={tagId} />
            <div className="space-y-2 my-4">
              <Label htmlFor="name" className="font-mono">Tag Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={tagName}
                required
                className="font-mono"
              />
            </div>
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-foreground text-amber-50 rounded-md">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" className="rounded-md border-2 border-red-800 shadow-[2px_2px_0px_0px_rgba(127,29,29,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">Delete</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-amber-50 border-2 border-foreground">
           <form action={async (formData) => {
              const result = await deleteTagWithId(formData);
              if (result?.success) toast.success(result.success);
              if (result?.error) toast.error(result.error);
          }}>
            <input type="hidden" name="tagId" value={tagId} />
            <AlertDialogHeader>
                <AlertDialogTitle className="font-serif">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="font-mono">
                This will permanently delete the tag. This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
                <AlertDialogCancel asChild><RetroButton>Cancel</RetroButton></AlertDialogCancel>
                <AlertDialogAction type="submit" className="bg-red-600 text-white rounded-md">Continue</AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}