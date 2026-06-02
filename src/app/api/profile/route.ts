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
import { listNotes } from "@/lib/notes-service";
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

export async function GET() {
  const homepage = await getHomepageContent();
  const notes = await listNotes();

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
    notes: notes.map((note: (typeof notes)[number]) => ({
      id: note.id,
      title: note.title,
      slug: note.slug,
      summary: note.summary,
      tags: note.tags,
      updatedAt: note.updatedAt,
    })),
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
