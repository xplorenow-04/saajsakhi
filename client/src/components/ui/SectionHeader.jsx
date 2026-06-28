import { motion } from 'framer-motion';

export default function SectionHeader({
  title,
  subtitle,
  align = 'center',
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className={`mb-12 ${align === 'center' ? 'text-center' : ''} ${className}`}
    >
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-display italic mb-4 text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="text-secondary text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
