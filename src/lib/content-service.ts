import type { CaseStudy as PrismaCaseStudy, Domain, Topic } from "@prisma/client";

import { getDb } from "@/lib/db";
import {
  caseStudies,
  domainDetails,
  siteMetrics,
  siteProfile,
  type CaseStudy,
  type DomainDetail,
} from "@/lib/site-content";

type DomainWithTopics = Domain & {
  topics: Topic[];
};

function mapDomainRecord(domain: DomainWithTopics): DomainDetail {
  return {
    slug: domain.slug,
    title: domain.title,
    strapline: domain.strapline,
    summary: domain.summary,
    overview: domain.overview,
    icon: domain.icon as DomainDetail["icon"],
    expertiseLevel: domain.expertiseLevel,
    highlights: domain.highlights,
    principles: domain.principles,
    topics: domain.topics
      .sort((left, right) => left.order - right.order)
      .map((topic) => ({
        title: topic.title,
        summary: topic.summary,
        body: topic.bodyMarkdown,
      })),
  };
}

function mapCaseStudyRecord(caseStudy: PrismaCaseStudy): CaseStudy {
  const fallback = caseStudies.find((item) => item.slug === caseStudy.slug);

  return {
    slug: caseStudy.slug,
    title: caseStudy.title,
    summary: caseStudy.summary,
    context: caseStudy.context,
    impact: caseStudy.impact,
    stack: caseStudy.stack,
    proofLines: fallback?.proofLines ?? [],
  };
}

async function loadDomains(): Promise<DomainDetail[]> {
  const db = getDb();

  if (!db) {
    return domainDetails;
  }

  try {
    const domains = await db.domain.findMany({
      include: {
        topics: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    if (!domains.length) {
      return domainDetails;
    }

    return domains.map(mapDomainRecord);
  } catch {
    return domainDetails;
  }
}

async function loadCaseStudies(): Promise<CaseStudy[]> {
  const db = getDb();

  if (!db) {
    return caseStudies;
  }

  try {
    const records = await db.caseStudy.findMany({
      orderBy: {
        order: "asc",
      },
    });

    if (!records.length) {
      return caseStudies;
    }

    return records.map(mapCaseStudyRecord);
  } catch {
    return caseStudies;
  }
}

export async function getHomepageContent() {
  const [domains, featuredCaseStudies] = await Promise.all([
    loadDomains(),
    loadCaseStudies(),
  ]);

  return {
    profile: siteProfile,
    metrics: siteMetrics,
    domains,
    caseStudies: featuredCaseStudies,
  };
}

export async function getDomains() {
  return loadDomains();
}

export async function getDomainBySlug(slug: string) {
  const domains = await loadDomains();

  return domains.find((domain) => domain.slug === slug) ?? null;
}
