import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { profile } from '@/lib/profile';
import { DOCUMENT_BUCKET, publicFileUrl } from '@/lib/storage';

interface CvButtonProps {
  cvPath: string | null | undefined;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  className?: string;
}

/** Downloads the CV uploaded in admin > Présentation. Renders nothing until a CV exists. */
export function CvButton({ cvPath, size = 'default', variant = 'outline', className }: CvButtonProps) {
  if (!cvPath) return null;

  return (
    <Button asChild size={size} variant={variant} className={className}>
      <a href={publicFileUrl(DOCUMENT_BUCKET, cvPath, profile.cvFileName)} download={profile.cvFileName}>
        <FileText />
        Télécharger mon CV
      </a>
    </Button>
  );
}
