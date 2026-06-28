import { motion } from 'framer-motion';
import { IoRemove, IoAdd } from 'react-icons/io5';

export default function QuantitySelector({ quantity, onIncrease, onDecrease, min = 1, max = 10 }) {
  return (
    <div className="flex items-center gap-3">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onDecrease}
        disabled={quantity <= min}
        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-surface2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <IoRemove size={14} />
      </motion.button>
      <span className="w-8 text-center font-medium">{quantity}</span>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onIncrease}
        disabled={quantity >= max}
        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-surface2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <IoAdd size={14} />
      </motion.button>
    </div>
  );
}
