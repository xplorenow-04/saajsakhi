import { Minus, Plus } from "lucide-react";

export default function QuantitySelector({ value, onChange, min = 1, max = 99 }) {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="inline-flex items-center bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className="w-9 h-10 flex items-center justify-center text-text-muted hover:text-accent hover:bg-surface-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Minus size={14} />
      </button>
      <span className="w-10 h-10 flex items-center justify-center text-sm font-medium text-text-primary border-x border-surface-600">
        {value}
      </span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className="w-9 h-10 flex items-center justify-center text-text-muted hover:text-accent hover:bg-surface-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
