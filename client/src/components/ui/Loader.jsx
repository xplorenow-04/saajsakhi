export default function Loader({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 border-2 border-border rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-accent rounded-full animate-spin" />
      </div>
    </div>
  );
}
