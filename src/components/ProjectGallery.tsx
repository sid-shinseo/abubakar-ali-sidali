import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { ProjectImage } from '@/types';

/** Diagrams and screenshots of a project. Clicking one opens it full size. */
export function ProjectGallery({ images }: { images: ProjectImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const current = openIndex !== null ? images[openIndex] : null;

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        {images.map((image, index) => (
          <figure key={image.url} className={images.length === 1 ? 'sm:col-span-2' : undefined}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="surface block w-full cursor-zoom-in overflow-hidden transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-card-hover"
            >
              {/* Diagrams often have a transparent background: give them a light canvas.
                  A single image keeps its own proportions; several share one height to line up. */}
              <img
                src={image.url}
                alt={image.caption || `Illustration ${index + 1}`}
                loading="lazy"
                className={images.length === 1 ? 'h-auto w-full bg-white' : 'aspect-[16/10] w-full bg-white object-contain'}
              />
            </button>
            {image.caption && <figcaption className="mt-2 text-sm text-muted-foreground">{image.caption}</figcaption>}
          </figure>
        ))}
      </div>

      <Dialog open={current !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="max-h-[92vh] w-[96vw] max-w-6xl overflow-y-auto p-4 sm:max-w-6xl">
          <DialogTitle className="pr-8 text-base">{current?.caption || 'Illustration'}</DialogTitle>
          <DialogDescription className="sr-only">Image en taille réelle</DialogDescription>
          {current && <img src={current.url} alt={current.caption} className="w-full rounded-md bg-white object-contain" />}
          {images.length > 1 && openIndex !== null && (
            <div className="flex items-center justify-between gap-3 text-sm">
              <button
                type="button"
                className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
                disabled={openIndex === 0}
                onClick={() => setOpenIndex(openIndex - 1)}
              >
                Précédente
              </button>
              <span className="font-mono text-xs text-muted-foreground">
                {openIndex + 1} / {images.length}
              </span>
              <button
                type="button"
                className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
                disabled={openIndex === images.length - 1}
                onClick={() => setOpenIndex(openIndex + 1)}
              >
                Suivante
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
