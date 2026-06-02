import { SectionSkeleton } from "@/components/section-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-12 lg:px-8">
      <SectionSkeleton lines={4} />
      <SectionSkeleton lines={5} />
    </div>
  );
}
