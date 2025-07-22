import { prisma } from '@/lib/prisma';
import PostCard from '@/components/PostCard';
import PaginationControls from '@/components/PaginationControls';
import TagsCloud from '@/components/TagsCloud';

const POSTS_PER_PAGE = 6;

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
  searchParams: { [key:string]: string | string[] | undefined };
}) {
  const page = Number(searchParams['page']) || 1;
  const { posts, totalPosts } = await getPaginatedPublishedPosts(page);

  const hasNextPage = page * POSTS_PER_PAGE < totalPosts;
  const hasPrevPage = page > 1;

  return (
    <main className="bg-amber-50 min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <header className="text-center mb-16 md:mb-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif tracking-tighter text-foreground"
              style={{ textShadow: '2px 2px 2px rgba(0,0,0,1)' }}>
            Welcome to My Blog
          </h1>
          <p className="mt-6 text-lg md:text-xl text-foreground/80 font-mono max-w-2xl mx-auto leading-relaxed">
            Thoughts, stories, and ideas from the tech world—explored and shared.
          </p>
        </header>

        {posts.length > 0 ? (
          <section className="grid gap-x-8 gap-y-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
              />
            ))}
          </section>
        ) : (
          <section className="text-center py-16 space-y-4 bg-white backdrop-blur-sm rounded-xl border-2 border-foreground">
            <h2 className="text-2xl md:text-3xl font-semibold font-serif text-foreground">
              No posts yet
            </h2>
            <p className="mt-2 text-foreground/80 font-mono max-w-md mx-auto">
              Come back soon—we're cooking up something interesting.
            </p>
          </section>
        )}

        {/* --- 2. Add the TagsCloud component here --- */}
        <TagsCloud />

        {/* Pagination controls with retro styling */}
        <div className="mt-16">
          <PaginationControls
            currentPage={page}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            basePath="/"
          />
        </div>
      </div>
    </main>
  );
}