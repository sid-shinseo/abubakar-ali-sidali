import { useRef, useState } from 'react';
import { FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/dates';
import { errorMessage } from '@/lib/errors';
import { profile } from '@/lib/profile';
import { DOCUMENT_BUCKET, publicFileUrl, removeFiles, uploadFile } from '@/lib/storage';
import { useAdminData } from './admin-data';

const MAX_CV_SIZE = 10 * 1024 * 1024;

/** Uploads / replaces / removes the downloadable CV. Saved immediately, independently of the presentation form. */
export function CvCard() {
  const { about } = useAdminData();
  const [isBusy, setIsBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cvPath = about.aboutMe?.cv_path ?? null;

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Le CV doit être un fichier PDF.');
      return;
    }
    if (file.size > MAX_CV_SIZE) {
      toast.error('Le PDF dépasse 10 Mo.');
      return;
    }

    setIsBusy(true);
    let uploadedPath: string | null = null;
    try {
      uploadedPath = (await uploadFile(DOCUMENT_BUCKET, 'cv', file)).path;
      await about.setCvPath(uploadedPath);
      if (cvPath) void removeFiles(DOCUMENT_BUCKET, [cvPath]);
      toast.success(cvPath ? 'CV remplacé.' : 'CV en ligne.');
    } catch (err) {
      if (uploadedPath) void removeFiles(DOCUMENT_BUCKET, [uploadedPath]);
      toast.error(`Envoi impossible : ${errorMessage(err)}`);
    } finally {
      setIsBusy(false);
    }
  };

  const removeCv = async () => {
    if (!cvPath) return;
    setIsBusy(true);
    try {
      await about.setCvPath(null);
      void removeFiles(DOCUMENT_BUCKET, [cvPath]);
      toast.success('CV retiré du site.');
    } catch (err) {
      toast.error(`Action impossible : ${errorMessage(err)}`);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section className="surface grid gap-4 p-6">
      <div>
        <h2 className="font-medium">CV</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Un bouton « Télécharger mon CV » apparaît sur l'accueil et la page Contact. Le fichier est téléchargé sous le nom {profile.cvFileName}.
        </p>
      </div>

      {cvPath ? (
        <div className="flex flex-wrap items-center gap-3 rounded-md border p-3">
          <FileText className="size-5 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">CV en ligne</p>
            {about.aboutMe?.updated_at && (
              <p className="font-mono text-xs text-muted-foreground">Mis à jour le {formatDateTime(about.aboutMe.updated_at)}</p>
            )}
          </div>
          <Button asChild variant="ghost" size="sm">
            <a href={publicFileUrl(DOCUMENT_BUCKET, cvPath)} target="_blank" rel="noreferrer">
              Ouvrir
            </a>
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={isBusy} onClick={() => void removeCv()}>
            Retirer
          </Button>
        </div>
      ) : (
        <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">Aucun CV en ligne pour le moment.</p>
      )}

      <div>
        <input ref={inputRef} type="file" accept="application/pdf" className="sr-only" id="cv-file" onChange={(e) => void handleFile(e)} />
        <Button type="button" variant="outline" disabled={isBusy} onClick={() => inputRef.current?.click()}>
          <Upload />
          {isBusy ? 'Envoi…' : cvPath ? 'Remplacer le CV' : 'Ajouter mon CV (PDF)'}
        </Button>
      </div>
    </section>
  );
}
