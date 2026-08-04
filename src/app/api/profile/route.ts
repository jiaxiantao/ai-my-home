import { NextResponse } from "next/server";

import { getHomepageContent } from "@/lib/content-service";
import {
  architectureScenarios,
  blueprintConstraints,
  blueprintModes,
  performanceContexts,
  performanceSignals,
  workflowCapabilities,
} from "@/lib/demo-lab-content";
import {
  currentTracks,
  experienceChapters,
  workLogs,
} from "@/lib/ongoing-content";
import {
  careerTimeline,
  interviewHighlights,
  playbooks,
  resumeDimensions,
  techStackGroups,
} from "@/lib/showcase-content";
import { KNOWLEDGE_STUDIO_URL } from "@/lib/external-projects";

export async function GET() {
  const homepage = await getHomepageContent();

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    profile: homepage.profile,
    metrics: homepage.metrics,
    domains: homepage.domains.map((domain) => ({
      slug: domain.slug,
      title: domain.title,
      strapline: domain.strapline,
      summary: domain.summary,
      expertiseLevel: domain.expertiseLevel,
      highlights: domain.highlights,
    })),
    caseStudies: homepage.caseStudies,
    knowledgeStudio: {
      url: KNOWLEDGE_STUDIO_URL,
      summary: "笔记知识库已抽离至独立项目 Knowledge Studio",
    },
    timeline: careerTimeline,
    currentTracks,
    workLogs,
    experienceChapters,
    resumeDimensions,
    interviewHighlights,
    playbooks,
    techStackGroups,
    demoLab: {
      architectureScenarios,
      performanceContexts,
      performanceSignals,
      workflowCapabilities,
      blueprintModes,
      blueprintConstraints,
    },
  });
}
