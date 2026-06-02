type NoteLike = { title: string; tags?: string[] };
type CaseLike = { title: string; slug: string };

const basePrompts: string[] = [
  "首页 LCP 偏高，请给分层优化方案与可量化指标",
  "Next.js 16 项目如何做 RSC 与客户端组件边界划分",
  "发布前质量门禁应包含哪些检查项与回滚策略",
  "浏览器端 Transformers.js 推理如何控制首包与内存",
];

export function buildIntelligenceSamplePrompts(
  notes: NoteLike[],
  cases: CaseLike[],
): string[] {
  const prompts = [...basePrompts];

  const topNote = notes[0];
  if (topNote?.title) {
    prompts.unshift(`结合笔记「${topNote.title}」给可执行重构步骤与风险清单`);
  }

  const topCase = cases[0];
  if (topCase?.title) {
    prompts.push(`参考案例「${topCase.title}」总结可复用的交付模式`);
  }

  return [...new Set(prompts)].slice(0, 6);
}
