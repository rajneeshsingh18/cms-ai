import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.post.create({
    data: {
      title: "Selling smartphone ",
      slug: "test-post-r",
      content: "This is a another test post",
      published: true,
      tags: ["test"]
    }
  })
  console.log('Seeding completed!')
}

main()
  .catch(e => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })