import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface PostData {
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  tags: { name: string }[];
}

export default function PostDisplay({ post }: { post: PostData }) {
  return (
    <article className="max-w-3xl mx-auto py-8 px-4">
      {post.imageUrl && (
        <div className="relative h-96 w-full mb-8">
          <Image src={post.imageUrl} alt={post.title} fill className="object-cover rounded-lg" />
        </div>
      )}
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">{post.title}</h1>
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
        <span>Published on {new Date(post.createdAt).toLocaleDateString()}</span>
        <div className="flex gap-2">
            {post.tags.map(tag => (
                <Badge key={tag.name} variant="secondary">{tag.name}</Badge>
            ))}
        </div>
      </div>

      {/* THIS IS THE CRITICAL PART */}
      {/* Ensure this div has the "prose" and "dark:prose-invert" classes */}
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}