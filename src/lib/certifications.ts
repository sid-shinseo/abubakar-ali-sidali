import type { CertificationStatus } from '@/types';

export const certificationStatuses: Array<{ value: CertificationStatus; label: string }> = [
  { value: 'obtenue', label: 'Obtenue' },
  { value: 'en_cours', label: 'En préparation' },
  { value: 'prevue', label: 'Prévue' },
];

export function certificationStatusLabel(status: CertificationStatus) {
  return certificationStatuses.find((item) => item.value === status)?.label ?? status;
}
