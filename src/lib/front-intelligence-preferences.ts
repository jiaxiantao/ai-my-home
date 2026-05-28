export type IntelligenceStyle = "steps" | "risk" | "code";
export type IntelligenceDepth = "brief" | "detailed";

export type IntelligencePreferences = {
  style: IntelligenceStyle;
  depth: IntelligenceDepth;
  includeMetrics: boolean;
};

const STORAGE_KEY = "assistant-intelligence-preferences-v1";

export const defaultIntelligencePreferences: IntelligencePreferences = {
  style: "steps",
  depth: "detailed",
  includeMetrics: true,
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
