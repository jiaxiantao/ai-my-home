"use client";

import {
  inferRecommendedPreferences,
  type IntelligenceLearningProfile,
  type IntelligencePreferences,
} from "@/lib/front-intelligence-preferences";

export function IntelligenceLearningPanel({
  learningProfile,
  preferences,
  onApplyRecommendation,
  onResetLearning,
}: {
  learningProfile: IntelligenceLearningProfile;
  preferences: IntelligencePreferences;
  onApplyRecommendation: (next: { style: IntelligencePreferences["style"]; depth: IntelligencePreferences["depth"] }) => void;
  onResetLearning: () => void;
}) {
  const recommended = inferRecommendedPreferences(learningProfile);

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">偏好学习画像</p>
      <div className="mt-2 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          风格得分：steps {learningProfile.styleScores.steps} / risk{" "}
          {learningProfile.styleScores.risk} / code {learningProfile.styleScores.code}
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          深度得分：brief {learningProfile.depthScores.brief} / detailed{" "}
          {learningProfile.depthScores.detailed}
        </div>
      </div>

      {recommended &&
      (recommended.style !== preferences.style ||
        recommended.depth !== preferences.depth) ? (
        <button
          type="button"
          onClick={() => onApplyRecommendation(recommended)}
          className="mt-3 rounded-full border border-amber-200/30 bg-amber-200/10 px-3 py-1 text-[11px] text-amber-100"
        >
          智能建议：改为 {recommended.style} / {recommended.depth}
        </button>
      ) : (
        <p className="mt-3 text-xs text-slate-500">学习样本不足或当前偏好已是最优推荐。</p>
      )}

      <button
        type="button"
        onClick={onResetLearning}
        className="mt-3 rounded-full border border-white/10 px-3 py-1 text-[11px] text-slate-400"
      >
        重置学习画像
      </button>
    </div>
  );
}
