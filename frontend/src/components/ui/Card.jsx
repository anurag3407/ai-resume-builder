import { cn } from '../../lib/utils';

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={cn(
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={cn('px-6 py-4 border-b border-white/10', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={cn('text-lg font-semibold text-white', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={cn('text-sm text-gray-400 mt-1', className)}>{children}</p>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div
      className={cn(
        'px-6 py-4 bg-white/5 border-t border-white/10 flex items-center justify-end gap-3',
        className
      )}
    >
      {children}
    </div>
  );
}
