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
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { deleteTagAction, updateTagAction } from './actions';
import { useState } from 'react';

export default function TagActions({ tagId, tagName }: { tagId: string, tagName: string }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState(tagName);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Updating tag...');

    const result = await updateTagAction(tagId, newTagName);

    if (result?.success) {
      toast.success(result.success);
      setIsEditDialogOpen(false); // Close the dialog on success
    } else if (result?.error) {
      toast.error(result.error);
    }
  };

  const handleDelete = async () => {
    toast.info('Deleting tag...');
    const result = await deleteTagAction(tagId);

    if (result?.success) {
      toast.success(result.success);
    } else if (result?.error) {
      toast.error(result.error);
    }
  };

  return (
    <div className="flex gap-2 justify-end">
      {/* Edit Button and Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">Edit</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tagName">Tag Name</Label>
              <Input
                id="tagName"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Button and Dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">Delete</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the tag.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <div><AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction></div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}