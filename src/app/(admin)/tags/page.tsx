import { prisma } from '@/lib/prisma';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TagActions from './TagActions';
import CreateTagForm from './CreateTagForm'; // Import the new client component

/**
 * Fetches all tags from the database to display in the table.
 */
async function getAllTags() {
  return await prisma.tag.findMany({
    orderBy: { id: 'desc' },
    include: { _count: { select: { posts: true } } },
  });
}

/**
 * The main server component for the admin tags management page.
 */
export default async function TagsPage() {
  const tags = await getAllTags();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold font-serif tracking-wide">Manage Tags</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Render the new CreateTagForm client component */}
        <div className="md:col-span-1">
          <CreateTagForm />
        </div>

        {/* Tags Table */}
        <div className="md:col-span-2">
          <div className="bg-white border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-amber-100">
                <TableRow className="border-b-2 border-foreground">
                  <TableHead className="font-serif text-foreground">Name</TableHead>
                  <TableHead className="font-serif text-foreground">Post Count</TableHead>
                  <TableHead className="font-serif text-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map(tag => (
                  <TableRow key={tag.id} className="border-b-2 border-foreground/30 last:border-b-0">
                    <TableCell className="font-mono font-semibold">{tag.name}</TableCell>
                    <TableCell className="font-mono">{tag._count.posts}</TableCell>
                    <TableCell>
                      <TagActions tagId={tag.id} tagName={tag.name} />
                    </TableCell>
                  </TableRow>
                ))}
                {tags.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center h-24 font-mono">No tags found.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}