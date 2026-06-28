import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';

export default function Drawer({ isOpen, onClose, children, title, side = 'right' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const slideFrom = side === 'right' ? { x: '100%' } : { x: '-100%' };
  const slideTo = { x: 0 };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={slideFrom}
            animate={slideTo}
            exit={slideFrom}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`absolute top-0 bottom-0 ${side === 'right' ? 'right-0' : 'left-0'} w-full max-w-md bg-surface border-l border-border shadow-xl`}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface2 transition-colors"
              >
                <IoClose size={20} />
              </button>
            </div>
            <div className="overflow-y-auto h-[calc(100%-73px)]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
