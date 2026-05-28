export type IntelligenceStyle = "steps" | "risk" | "code";
export type IntelligenceDepth = "brief" | "detailed";

export type IntelligencePreferences = {
  style: IntelligenceStyle;
  depth: IntelligenceDepth;
  includeMetrics: boolean;
};

export type IntelligenceLearningProfile = {
  styleScores: Record<IntelligenceStyle, number>;
  depthScores: Record<IntelligenceDepth, number>;
};

const STORAGE_KEY = "assistant-intelligence-preferences-v1";
const LEARNING_STORAGE_KEY = "assistant-intelligence-learning-v1";

export const defaultIntelligencePreferences: IntelligencePreferences = {
  style: "steps",
  depth: "detailed",
  includeMetrics: true,
};

export const defaultLearningProfile: IntelligenceLearningProfile = {
  styleScores: {
    steps: 0,
    risk: 0,
    code: 0,
  },
  depthScores: {
    brief: 0,
    detailed: 0,
  },
};

export function loadIntelligencePreferences(): IntelligencePreferences {
  if (typeof window === "undefined") {
    return defaultIntelligencePreferences;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultIntelligencePreferences;
    }
    const parsed = JSON.parse(raw) as Partial<IntelligencePreferences>;
    return {
      style:
        parsed.style === "steps" || parsed.style === "risk" || parsed.style === "code"
          ? parsed.style
          : defaultIntelligencePreferences.style,
      depth:
        parsed.depth === "brief" || parsed.depth === "detailed"
          ? parsed.depth
          : defaultIntelligencePreferences.depth,
      includeMetrics:
        typeof parsed.includeMetrics === "boolean"
          ? parsed.includeMetrics
          : defaultIntelligencePreferences.includeMetrics,
    };
  } catch {
    return defaultIntelligencePreferences;
  }
}

export function saveIntelligencePreferences(value: IntelligencePreferences) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function loadLearningProfile(): IntelligenceLearningProfile {
  if (typeof window === "undefined") {
    return defaultLearningProfile;
  }
  try {
    const raw = window.localStorage.getItem(LEARNING_STORAGE_KEY);
    if (!raw) {
      return defaultLearningProfile;
    }
    const parsed = JSON.parse(raw) as Partial<IntelligenceLearningProfile>;
    return {
      styleScores: {
        steps: Number(parsed.styleScores?.steps ?? 0),
        risk: Number(parsed.styleScores?.risk ?? 0),
        code: Number(parsed.styleScores?.code ?? 0),
      },
      depthScores: {
        brief: Number(parsed.depthScores?.brief ?? 0),
        detailed: Number(parsed.depthScores?.detailed ?? 0),
      },
    };
  } catch {
    return defaultLearningProfile;
  }
}

export function saveLearningProfile(profile: IntelligenceLearningProfile) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(profile));
}

export function bumpLearningProfile(
  profile: IntelligenceLearningProfile,
  signal: Partial<{
    style: IntelligenceStyle;
    depth: IntelligenceDepth;
  }>,
) {
  return {
    styleScores: {
      ...profile.styleScores,
      ...(signal.style
        ? {
            [signal.style]: profile.styleScores[signal.style] + 1,
          }
        : {}),
    },
    depthScores: {
      ...profile.depthScores,
      ...(signal.depth
        ? {
            [signal.depth]: profile.depthScores[signal.depth] + 1,
          }
        : {}),
    },
  };
}

export function inferRecommendedPreferences(
  profile: IntelligenceLearningProfile,
): Pick<IntelligencePreferences, "style" | "depth"> | null {
  const styleEntries = Object.entries(profile.styleScores) as Array<
    [IntelligenceStyle, number]
  >;
  const depthEntries = Object.entries(profile.depthScores) as Array<
    [IntelligenceDepth, number]
  >;
  const [style, styleScore] = [...styleEntries].sort((a, b) => b[1] - a[1])[0];
  const [depth, depthScore] = [...depthEntries].sort((a, b) => b[1] - a[1])[0];

  if (styleScore + depthScore < 3) {
    return null;
  }

  return { style, depth };
}
