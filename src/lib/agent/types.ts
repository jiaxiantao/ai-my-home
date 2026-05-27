export type AgentToolName = "search_notes" | "calculate" | "current_time";

export type AgentPlan =
  | {
      action: "tool";
      tool: AgentToolName;
      args: Record<string, unknown>;
      reasoning: string;
    }
  | {
      action: "answer";
      answer: string;
      reasoning: string;
    };

export type AgentToolResult = {
  tool: AgentToolName;
  args: Record<string, unknown>;
  output: string;
};

export type AgentTraceEvent =
  | { type: "trace"; phase: string; message: string }
  | { type: "plan"; plan: AgentPlan }
  | { type: "tool_call"; tool: AgentToolName; args: Record<string, unknown> }
  | { type: "tool_result"; tool: AgentToolName; output: string }
  | { type: "answer"; text: string; mock?: boolean }
  | { type: "done"; steps: number }
  | { type: "error"; message: string };
