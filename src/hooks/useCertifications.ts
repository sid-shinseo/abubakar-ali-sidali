import type { Certification, CertificationInput } from '@/types';
import { useTable } from './useTable';

const options = {
  orderBy: [
    ['order_index', true],
    ['created_at', true],
  ] as Array<[string, boolean]>,
};

export function useCertifications() {
  const table = useTable<Certification, CertificationInput>('certifications', options);

  return {
    certifications: table.items,
    loading: table.loading,
    error: table.error,
    createCertification: table.create,
    updateCertification: table.update,
    deleteCertification: table.remove,
    reorderCertifications: table.reorder,
  };
}
