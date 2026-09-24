import type { Skill, SkillInput } from '@/types';
import { useTable } from './useTable';

const options = {
  orderBy: [
    ['order_index', true],
    ['created_at', true],
  ] as Array<[string, boolean]>,
};

export function useSkills() {
  const table = useTable<Skill, SkillInput>('skills', options);

  return {
    skills: table.items,
    loading: table.loading,
    error: table.error,
    createSkill: table.create,
    updateSkill: table.update,
    deleteSkill: table.remove,
    reorderSkills: table.reorder,
  };
}
