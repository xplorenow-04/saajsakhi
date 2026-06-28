import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-accent-gradient text-white hover:shadow-lg hover:shadow-accent/25',
  secondary: 'bg-surface2 text-primary hover:bg-surface3 border border-border',
  ghost: 'text-secondary hover:text-primary hover:bg-surface2',
  outline: 'border border-border text-primary hover:bg-surface2',
  danger: 'bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
  icon: 'p-3',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  magnetic = false,
  ...props
}, ref) => {
  return (
    <motion.button
      ref={ref}
      whileHover={magnetic ? { scale: 1.02 } : { scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`
        magnetic-btn font-medium rounded-full transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </span>
      ) : children}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
