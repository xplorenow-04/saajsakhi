import { Link } from "react-router-dom";
import { ShoppingBag, Package, Search, Heart } from "lucide-react";

const icons = { ShoppingBag, Package, Search, Heart };

export default function EmptyState({
  icon,
  title = "Nothing here",
  description = "Looks like there's nothing to display.",
  actionLabel,
  actionLink,
}) {
  const Icon = typeof icon === "string" ? icons[icon] : icon;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {Icon && (
        <div className="w-20 h-20 rounded-2xl bg-lux-light flex items-center justify-center mb-6">
          <Icon size={32} className="text-lux-accent" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="font-display text-xl font-bold text-lux-text mb-2">{title}</h3>
      <p className="text-sm text-lux-muted max-w-xs leading-relaxed mb-6">{description}</p>
      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn-luxury text-sm">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
