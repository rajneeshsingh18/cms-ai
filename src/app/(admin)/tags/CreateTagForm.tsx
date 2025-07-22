'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createTagAction } from './actions';
import { useRef } from 'react';

/**
 * A client component for the "Create New Tag" form.
 * Handles form submission and displays toast notifications.
 */
export default function CreateTagForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleCreateTag = async (formData: FormData) => {
    const result = await createTagAction(formData);

    if (result?.success) {
      toast.success(result.success);
      formRef.current?.reset(); // Clear the form input on success
    } else if (result?.error) {
      toast.error(result.error);
    }
  };

  return (
    <Card className="bg-white border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
      <CardHeader>
        <CardTitle className="font-serif tracking-wide">Create New Tag</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleCreateTag} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name" className="font-mono font-semibold">Tag Name</Label>
            <Input id="name" name="name" required className="font-mono" />
          </div>
          <Button type="submit" className="w-full bg-foreground text-amber-50 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
            Create Tag
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}