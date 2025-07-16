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
 * @returns {Promise<object>} An object containing total, published, and draft post counts.
 */
async function getPostStats() {
  // Promise.all runs all database queries concurrently for better performance.
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
      <h1 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Posts Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <BookCopy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              All blog posts you have created.
            </p>
          </CardContent>
        </Card>

        {/* Published Posts Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Published Posts
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedPosts}</div>
            <p className="text-xs text-muted-foreground">
              Posts available to the public.
            </p>
          </CardContent>
        </Card>

        {/* Drafts Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftPosts}</div>
            <p className="text-xs text-muted-foreground">
              Posts not yet published.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}