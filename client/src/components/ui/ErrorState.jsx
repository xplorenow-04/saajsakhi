import { motion } from 'framer-motion';
import { IoAlertCircle } from 'react-icons/io5';
import Button from './Button';

export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mb-6">
        <IoAlertCircle size={40} className="text-danger" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Error</h3>
      <p className="text-secondary max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary">
          Try Again
        </Button>
      )}
    </motion.div>
  );
}
