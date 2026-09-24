import type { SkillLevel } from '@/types';

export const skillLevels: Array<{ value: SkillLevel; label: string; rank: number; description: string }> = [
  { value: 'notions', label: 'Notions', rank: 1, description: 'Déjà pratiqué, bases acquises' },
  { value: 'autonome', label: 'Autonome', rank: 2, description: 'Utilisé en projet ou en stage sans assistance' },
  { value: 'maitrise', label: 'Maîtrise', rank: 3, description: 'Pratique régulière, capable de former ou dépanner' },
];

export function skillLevelInfo(level: SkillLevel) {
  return skillLevels.find((item) => item.value === level) ?? skillLevels[1];
}
