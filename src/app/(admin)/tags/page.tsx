import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { prisma } from '@/lib/prisma';
import TagActions from './TagActions'; // Import the new component

/**
 * Fetches all tags from the database and includes a count of
 * how many posts are associated with each tag.
 */
async function getTagsWithPostCount() {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { posts: true }, // Prisma feature to count related records
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
  return tags;
}

export default async function TagsPage() {
  const tags = await getTagsWithPostCount();
  const numColumns = 3; // For the empty state row

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Tag Management</h1>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tag Name</TableHead>
              <TableHead>Post Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.length > 0 ? (
              tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">{tag.name}</TableCell>
                  <TableCell>{tag._count.posts}</TableCell>
                  <TableCell className="text-right">
                    {/* Use the TagActions component for the delete button */}
                    <TagActions tagId={tag.id} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={numColumns} className="h-24 text-center">
                  No tags found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}