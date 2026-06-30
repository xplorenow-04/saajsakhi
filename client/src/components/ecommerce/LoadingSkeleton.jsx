export default function LoadingSkeleton({ type = "card", count = 1 }) {
  const items = Array.from({ length: count });

  if (type === "card") {
    return (
      <>
        {items.map((_, i) => (
          <div key={i} className="bg-lux-card rounded-2xl border border-lux-border overflow-hidden shadow-card">
            <div className="aspect-[4/5] shimmer bg-lux-warm" />
            <div className="p-4 space-y-3">
              <div className="h-2.5 shimmer bg-lux-border rounded-full w-1/4" />
              <div className="h-3.5 shimmer bg-lux-border rounded-full w-4/5" />
              <div className="h-3.5 shimmer bg-lux-border rounded-full w-3/5" />
              <div className="flex gap-2 pt-1">
                <div className="h-6 w-9 shimmer bg-lux-border rounded-lg" />
                <div className="h-6 w-9 shimmer bg-lux-border rounded-lg" />
                <div className="h-6 w-9 shimmer bg-lux-border rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (type === "list") {
    return (
      <>
        {items.map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-lux-card rounded-2xl border border-lux-border shadow-card">
            <div className="w-20 h-20 rounded-xl shimmer bg-lux-warm flex-shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="h-3 shimmer bg-lux-border rounded-full w-3/4" />
              <div className="h-3 shimmer bg-lux-border rounded-full w-1/2" />
              <div className="h-3 shimmer bg-lux-border rounded-full w-1/4" />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (type === "text") {
    return (
      <div className="space-y-3">
        {items.map((_, i) => (
          <div key={i} className="h-4 shimmer bg-lux-border rounded-full" style={{ width: `${70 + (i % 3) * 10}%` }} />
        ))}
      </div>
    );
  }

  return null;
}
