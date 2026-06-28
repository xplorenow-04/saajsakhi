import { motion } from 'framer-motion';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  onAction,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {Icon && (
        <div className="w-20 h-20 rounded-full bg-surface2 flex items-center justify-center mb-6">
          <Icon size={40} className="text-muted" />
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-secondary max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={onAction} variant="primary">
          {action}
        </Button>
      )}
    </motion.div>
  );
}
