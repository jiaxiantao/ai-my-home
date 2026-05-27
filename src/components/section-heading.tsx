type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="max-w-3xl space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="text-sm leading-7 text-slate-400 md:text-base">{description}</p>
      ) : null}
    </div>
  );
}
