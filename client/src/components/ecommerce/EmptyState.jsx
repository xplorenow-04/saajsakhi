import { Link } from "react-router-dom";
import { Package } from "lucide-react";

export default function EmptyState({
  icon: Icon = Package,
  title = "Nothing here yet",
  description = "",
  actionLabel,
  actionLink,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-surface-800 border border-surface-700/50 flex items-center justify-center mb-5">
        <Icon size={36} className="text-text-muted" />
      </div>

      <h3 className="text-lg font-semibold text-text-primary mb-1.5">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-text-muted text-center max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
