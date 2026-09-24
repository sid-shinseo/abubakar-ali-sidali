import type { Experience, ExperienceInput } from '@/types';
import { useTable } from './useTable';

const options = {
  orderBy: [
    ['order_index', true],
    ['created_at', false],
  ] as Array<[string, boolean]>,
};

export function useExperiences() {
  const table = useTable<Experience, ExperienceInput>('experiences', options);

  return {
    experiences: table.items,
    loading: table.loading,
    error: table.error,
    createExperience: table.create,
    updateExperience: table.update,
    deleteExperience: table.remove,
    reorderExperiences: table.reorder,
  };
}
