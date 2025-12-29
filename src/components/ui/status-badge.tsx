import { cn } from '@/lib/utils';
import { TestStatus } from '@/types';

interface StatusBadgeProps {
  status: TestStatus | 'active' | 'completed';
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pendiente',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  sample_taken: {
    label: 'Muestra Tomada',
    className: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  },
  in_progress: {
    label: 'En Proceso',
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  completed: {
    label: 'Completado',
    className: 'bg-success/10 text-success border-success/20',
  },
  active: {
    label: 'Activa',
    className: 'bg-primary/10 text-primary border-primary/20',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
