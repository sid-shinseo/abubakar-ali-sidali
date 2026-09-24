import { resolveTechIcon, techIconColor } from '@/lib/tech-icons';
import { cn } from '@/lib/utils';

interface TechIconProps {
  name: string;
  className?: string;
}

/** Official logo of a technology, or a generic icon in the accent colour when it has none. */
export function TechIcon({ name, className }: TechIconProps) {
  const resolved = resolveTechIcon(name);

  if (resolved.kind === 'concept') {
    const Icon = resolved.icon;
    return <Icon aria-hidden strokeWidth={2} className={cn('size-3.5 shrink-0 text-primary/85', className)} />;
  }

  const { scale = 1, hex, path } = resolved.icon;

  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn('size-3.5 shrink-0', className)} style={{ fill: techIconColor(hex) }}>
      {/* Scaled around the centre so every logo occupies a similar visual area. */}
      <path d={path} transform={scale === 1 ? undefined : `translate(12 12) scale(${scale}) translate(-12 -12)`} />
    </svg>
  );
}

/** Technology name preceded by its icon. */
export function TechName({ name, iconClassName }: { name: string; iconClassName?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <TechIcon name={name} className={iconClassName} />
      {name}
    </span>
  );
}
