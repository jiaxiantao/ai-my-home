export type CapabilityProfileScores = {
  fullstackApi: number;
  engineeringDemos: number;
  cicdRelease: number;
  edgeAi: number;
  visualization: number;
  security: number;
};

type CapabilityOverviewInput = {
  notesCount: number;
  domainsCount: number;
  caseStudiesCount: number;
  tracksCount: number;
  publishedNotesCount: number;
  demoCapabilitiesCount: number;
  releaseOrderCount?: number;
};

function clampScore(value: number) {
  return Math.min(100, Math.max(40, Math.round(value)));
}

export function buildCapabilityScores(
  overview: CapabilityOverviewInput,
): CapabilityProfileScores {
  const notesBoost = Math.min(overview.notesCount * 4, 24);
  const demoBoost = Math.min(overview.demoCapabilitiesCount * 3, 30);
  const releaseBoost = Math.min((overview.releaseOrderCount ?? 0) * 5, 15);

  return {
    fullstackApi: clampScore(72 + notesBoost),
    engineeringDemos: clampScore(68 + demoBoost),
    cicdRelease: clampScore(78 + Math.min(overview.caseStudiesCount * 3, 18) + releaseBoost),
    edgeAi: clampScore(80 + Math.min(overview.tracksCount * 4, 12)),
    visualization: clampScore(74 + Math.min(overview.domainsCount * 3, 18)),
    security: clampScore(70 + Math.min(overview.publishedNotesCount, 20)),
  };
}
