import { motion } from 'framer-motion';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-3 rounded-xl bg-surface2 border border-border hover:bg-surface3 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <IoChevronBack size={18} />
      </motion.button>
      {getPages().map(page => (
        <motion.button
          key={page}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(page)}
          className={`w-11 h-11 rounded-xl text-sm font-medium transition-all ${
            page === currentPage
              ? 'accent-gradient text-white'
              : 'bg-surface2 border border-border hover:bg-surface3 text-secondary'
          }`}
        >
          {page}
        </motion.button>
      ))}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-3 rounded-xl bg-surface2 border border-border hover:bg-surface3 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <IoChevronForward size={18} />
      </motion.button>
    </div>
  );
}
