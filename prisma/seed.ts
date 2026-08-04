import { caseStudies, domainDetails } from "../src/lib/site-content";
import { getDb } from "../src/lib/db";

function requireDb() {
  const prisma = getDb();

  if (!prisma) {
    throw new Error("DATABASE_URL is not configured");
  }

  return prisma;
}

const prisma = requireDb();

async function main() {
  await prisma.releaseAuditLog.deleteMany();
  await prisma.releaseOrder.deleteMany();
  await prisma.releaseApp.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.caseStudy.deleteMany();
  await prisma.domain.deleteMany();

  for (const [index, domain] of domainDetails.entries()) {
    await prisma.domain.create({
      data: {
        slug: domain.slug,
        title: domain.title,
        strapline: domain.strapline,
        summary: domain.summary,
        overview: domain.overview,
        icon: domain.icon,
        expertiseLevel: domain.expertiseLevel,
        highlights: domain.highlights,
        principles: domain.principles,
        order: index,
        topics: {
          create: domain.topics.map((topic, topicIndex) => ({
            title: topic.title,
            summary: topic.summary,
            bodyMarkdown: topic.body,
            order: topicIndex,
          })),
        },
      },
    });
  }

  for (const [index, caseStudy] of caseStudies.entries()) {
    await prisma.caseStudy.create({
      data: {
        slug: caseStudy.slug,
        title: caseStudy.title,
        summary: caseStudy.summary,
        context: caseStudy.context,
        impact: caseStudy.impact,
        stack: caseStudy.stack,
        order: index,
      },
    });
  }

  await prisma.releaseApp.create({
    data: {
      name: "ai-my-home-web",
      repo: "github.com/jiaxiantao/ai-my-home",
      buildCommand: "pnpm build",
      testCommand: "pnpm lint && pnpm test:e2e",
    },
  });

  console.log(
    [
      `Seeded ${domainDetails.length} domains`,
      `${caseStudies.length} cases`,
      `1 release app`,
    ].join(" · "),
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
