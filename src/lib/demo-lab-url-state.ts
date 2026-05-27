import {
  architectureScenarios,
  blueprintConstraints,
  blueprintModes,
  performanceContexts,
  performanceSignals,
  workflowCapabilities,
} from "@/lib/demo-lab-content";

export type DemoTabId = "architecture" | "performance" | "workflow" | "blueprint";

export type DemoLabUrlState = {
  tab: DemoTabId;
  scenario?: string;
  context?: string;
  signals?: string[];
  capabilities?: string[];
  constraints?: string[];
  mode?: string;
};

const validTabs = new Set<DemoTabId>([
  "architecture",
  "performance",
  "workflow",
  "blueprint",
]);

function isValidId(ids: string[], value: string | null) {
  return value && ids.includes(value);
}

export function parseDemoLabState(
  searchParams: Pick<URLSearchParams, "get">,
): DemoLabUrlState {
  const rawTab = searchParams.get("lab");
  const tab = validTabs.has(rawTab as DemoTabId)
    ? (rawTab as DemoTabId)
    : "architecture";

  const scenarioIds = architectureScenarios.map((item) => item.id);
  const contextIds = performanceContexts.map((item) => item.id);
  const signalIds = performanceSignals.map((item) => item.id);
  const capabilityIds = workflowCapabilities.map((item) => item.id);
  const constraintIds = blueprintConstraints.map((item) => item.id);
  const modeIds = blueprintModes.map((item) => item.id);

  const scenarioParam = searchParams.get("scenario");
  const contextParam = searchParams.get("ctx");
  const modeParam = searchParams.get("mode");

  const signals = searchParams
    .get("signals")
    ?.split(",")
    .filter((id) => signalIds.includes(id));

  const capabilities = searchParams
    .get("caps")
    ?.split(",")
    .filter((id) => capabilityIds.includes(id));

  const constraints = searchParams
    .get("constraints")
    ?.split(",")
    .filter((id) => constraintIds.includes(id));

  return {
    tab,
    scenario: isValidId(scenarioIds, scenarioParam)
      ? scenarioParam!
      : undefined,
    context: isValidId(contextIds, contextParam) ? contextParam! : undefined,
    signals: signals?.length ? signals : undefined,
    capabilities: capabilities?.length ? capabilities : undefined,
    constraints: constraints?.length ? constraints : undefined,
    mode: isValidId(modeIds, modeParam) ? modeParam! : undefined,
  };
}

export function buildDemoLabQuery(state: DemoLabUrlState) {
  const params = new URLSearchParams();
  params.set("lab", state.tab);

  if (state.tab === "architecture" && state.scenario) {
    params.set("scenario", state.scenario);
  }

  if (state.tab === "performance") {
    if (state.context) {
      params.set("ctx", state.context);
    }
    if (state.signals?.length) {
      params.set("signals", state.signals.join(","));
    }
  }

  if (state.tab === "workflow" && state.capabilities?.length) {
    params.set("caps", state.capabilities.join(","));
  }

  if (state.tab === "blueprint") {
    if (state.constraints?.length) {
      params.set("constraints", state.constraints.join(","));
    }
    if (state.mode) {
      params.set("mode", state.mode);
    }
  }

  return params.toString();
}

export function buildDemoLabShareUrl(state: DemoLabUrlState) {
  const query = buildDemoLabQuery(state);
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return `${origin}/?${query}#demo-lab`;
}
