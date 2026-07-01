const SkeletonPulse = ({ className = "" }) => (
  <div
    className={`bg-surface-700/60 rounded-lg animate-pulse ${className}`}
  />
);

function CardSkeleton() {
  return (
    <div className="bg-surface-800 rounded-xl overflow-hidden border border-surface-700/50">
      <SkeletonPulse className="aspect-[4/5] rounded-none" />
      <div className="p-4 space-y-3">
        <SkeletonPulse className="h-4 w-3/4" />
        <SkeletonPulse className="h-4 w-1/2" />
        <SkeletonPulse className="h-8 w-full" />
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      <SkeletonPulse className="aspect-[4/5] rounded-xl" />
      <div className="space-y-5">
        <SkeletonPulse className="h-3 w-20" />
        <SkeletonPulse className="h-7 w-3/4" />
        <SkeletonPulse className="h-5 w-1/3" />
        <div className="space-y-2 pt-2">
          <SkeletonPulse className="h-3 w-full" />
          <SkeletonPulse className="h-3 w-5/6" />
          <SkeletonPulse className="h-3 w-4/6" />
        </div>
        <div className="flex gap-2 pt-2">
          <SkeletonPulse className="h-9 w-16 rounded-lg" />
          <SkeletonPulse className="h-9 w-16 rounded-lg" />
          <SkeletonPulse className="h-9 w-16 rounded-lg" />
        </div>
        <div className="flex gap-3 pt-3">
          <SkeletonPulse className="h-12 w-32 rounded-lg" />
          <SkeletonPulse className="h-12 w-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-surface-800 rounded-xl border border-surface-700/50">
      <SkeletonPulse className="w-20 h-20 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonPulse className="h-4 w-2/3" />
        <SkeletonPulse className="h-4 w-1/4" />
      </div>
      <SkeletonPulse className="h-5 w-16" />
    </div>
  );
}

const skeletons = {
  card: CardSkeleton,
  detail: DetailSkeleton,
  list: ListSkeleton,
};

export default function LoadingSkeleton({ type = "card", count = 1 }) {
  const SkeletonComponent = skeletons[type] || CardSkeleton;

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </>
  );
}
