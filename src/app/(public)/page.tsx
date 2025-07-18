import { prisma } from '@/lib/prisma';
import PostCard from '@/components/PostCard';
import PaginationControls from '@/components/PaginationControls'; // Import the pagination component

const POSTS_PER_PAGE = 6; // Define how many posts to show per page

/**
 * Fetches a paginated list of PUBLISHED posts and the total post count.
 */
async function getPaginatedPublishedPosts(page: number = 1) {
  const skip = (page - 1) * POSTS_PER_PAGE;
  const take = POSTS_PER_PAGE;

  const [posts, totalPosts] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      include: { tags: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.post.count({ where: { published: true } }),
  ]);

  return { posts, totalPosts };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Number(searchParams['page']) || 1;
  const { posts, totalPosts } = await getPaginatedPublishedPosts(page);

  const hasNextPage = page * POSTS_PER_PAGE < totalPosts;
  const hasPrevPage = page > 1;

  return (
    <main className="container mx-auto px-4 py-12 md:py-16">
      <header className="text-center mb-16 md:mb-20">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-foreground">
          Welcome to My Blog
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Thoughts, stories, and ideas from the tech world—explored and shared.
        </p>
      </header>

      {posts.length > 0 ? (
        <section className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
            />
          ))}
        </section>
      ) : (
        <section className="text-center py-16 space-y-4 bg-muted/50 rounded-xl border border-border">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            No posts yet
          </h2>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            Come back soon—we're cooking up something interesting.
          </p>
        </section>
      )}

      {/* Add the pagination controls at the bottom */}
      <div className="mt-16">
        <PaginationControls
          currentPage={page}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          basePath="/"
        />
      </div>
    </main>
  );
}