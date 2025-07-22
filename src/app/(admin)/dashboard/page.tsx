import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { BookCopy, CheckCircle, Edit } from "lucide-react";

/**
 * Fetches post statistics from the database in parallel.
 */
async function getPostStats() {
  const [totalPosts, publishedPosts, draftPosts] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.post.count({ where: { published: false } }),
  ]);

  return { totalPosts, publishedPosts, draftPosts };
}

export default async function DashboardPage() {
  const { totalPosts, publishedPosts, draftPosts } = await getPostStats();

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold font-serif tracking-wide mb-8">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Total Posts Card */}
        <Card className="bg-white border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-mono font-semibold">Total Posts</CardTitle>
            <BookCopy className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{totalPosts}</div>
            <p className="text-xs font-mono text-foreground/80">
              All blog posts you have created.
            </p>
          </CardContent>
        </Card>

        {/* Published Posts Card */}
        <Card className="bg-white border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-mono font-semibold">
              Published Posts
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-700" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{publishedPosts}</div>
            <p className="text-xs font-mono text-foreground/80">
              Posts available to the public.
            </p>
          </CardContent>
        </Card>

        {/* Drafts Card */}
        <Card className="bg-white border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-mono font-semibold">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-amber-700" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{draftPosts}</div>
            <p className="text-xs font-mono text-foreground/80">
              Posts not yet published.
            </p>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
}