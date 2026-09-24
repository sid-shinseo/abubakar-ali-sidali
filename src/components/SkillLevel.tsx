import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { skillLevelInfo } from '@/lib/skill-levels';
import { cn } from '@/lib/utils';
import type { SkillLevel as Level } from '@/types';

interface SkillLevelProps {
  level: Level;
  /** Shows the level definition in a tooltip (hover or keyboard focus), with a dotted underline as a hint. */
  withTooltip?: boolean;
  className?: string;
}

/** Three short bars (1 to 3 filled) followed by the level name. */
export function SkillLevel({ level, withTooltip = false, className }: SkillLevelProps) {
  const info = skillLevelInfo(level);

  const content = (
    <>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3].map((step) => (
          <span key={step} className={cn('h-1.5 w-3 rounded-full', step <= info.rank ? 'bg-primary' : 'bg-muted-foreground/25')} />
        ))}
      </span>
      <span
        className={cn(
          'font-mono text-xs text-muted-foreground',
          withTooltip && 'underline decoration-muted-foreground/50 decoration-dotted underline-offset-4',
        )}
      >
        {info.label}
      </span>
    </>
  );

  if (!withTooltip) {
    return <span className={cn('inline-flex items-center gap-2', className)}>{content}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn('inline-flex cursor-help items-center gap-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}
          aria-label={`${info.label} : ${info.description}`}
        >
          {content}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-64">
        <span className="font-semibold">{info.label}</span> : {info.description}
      </TooltipContent>
    </Tooltip>
  );
}
