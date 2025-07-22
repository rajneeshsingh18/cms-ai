import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { type Post, type Tag } from '@prisma/client';

// Define a type for the data this component expects
type PostWithTags = Post & {
  tags: Tag[];
};

interface PostListProps {
  posts: PostWithTags[];
}

export default function PostList({ posts }: PostListProps) {
  const numColumns = 5;

  return (
    // Use bg-white for the table content area to contrast with the page background
    <div className="bg-white border-2 border-foreground">
      <Table>
        <TableHeader className="bg-amber-100">
          <TableRow className="border-b-2 border-foreground">
            <TableHead className="font-serif tracking-wider text-foreground">Title</TableHead>
            <TableHead className="font-serif tracking-wider text-foreground">Tags</TableHead>
            <TableHead className="font-serif tracking-wider text-foreground">Status</TableHead>
            <TableHead className="font-serif tracking-wider text-foreground">Created At</TableHead>
            <TableHead className="font-serif tracking-wider text-foreground text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.length > 0 ? (
            posts.map((post) => (
              <TableRow key={post.id} className="border-b-2 border-foreground last:border-b-0">
                <TableCell className="font-mono font-bold">{post.title}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        className="bg-white text-foreground border-2 border-foreground rounded-none font-mono text-xs px-2 py-0.5"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`rounded-none font-mono text-xs border-2 ${
                      post.published
                        ? 'bg-green-200 text-green-900 border-green-900'
                        : 'bg-amber-200 text-amber-900 border-amber-900'
                    }`}
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono">
                  {new Date(post.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="bg-amber-100 border-2 border-foreground rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                  >
                    <Link href={`/posts/edit/${post.id}`}>Edit</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={numColumns} className="h-24 text-center font-mono">
                No posts found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}