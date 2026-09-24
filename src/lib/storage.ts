import { supabase } from '@/lib/supabase';

export const IMAGE_BUCKET = 'project-covers';
export const DOCUMENT_BUCKET = 'documents';

const MAX_IMAGE_WIDTH = 1920;
const WEBP_QUALITY = 0.82;

/**
 * Resizes a photo to 1920 px wide at most and re-encodes it as WebP in the browser.
 * SVG and GIF are kept as-is (vector diagrams / animations), and so is any file the
 * conversion would not make smaller.
 */
export async function compressImage(file: File): Promise<File> {
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // format the browser can't decode: upload untouched
  }

  const scale = Math.min(1, MAX_IMAGE_WIDTH / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY));
  if (!blob || blob.size >= file.size) return file;

  const baseName = file.name.replace(/\.[^.]+$/, '');
  return new File([blob], `${baseName}.webp`, { type: 'image/webp' });
}

function safeFileName(name: string) {
  const cleaned = name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${Date.now()}-${cleaned || 'fichier'}`;
}

export async function uploadFile(bucket: string, folder: string, file: File) {
  const path = `${folder}/${safeFileName(file.name)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '31536000', contentType: file.type });
  if (error) throw error;
  return { path, url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl };
}

/** Public URL; with `downloadAs`, the browser saves the file under that name instead of opening it. */
export function publicFileUrl(bucket: string, path: string, downloadAs?: string) {
  return supabase.storage.from(bucket).getPublicUrl(path, downloadAs ? { download: downloadAs } : undefined).data.publicUrl;
}

/**
 * Deletes files from our storage given their public URLs. URLs pointing elsewhere
 * (images pasted from another site) are ignored. Failures are only logged: a leftover
 * file must never block the save the user asked for.
 */
export async function removeFilesByUrl(urls: Array<string | null | undefined>) {
  const byBucket = new Map<string, string[]>();
  for (const url of urls) {
    const match = url?.match(/\/storage\/v1\/object\/public\/([^/]+)\/([^?]+)/);
    if (!match) continue;
    const [, bucket, path] = match;
    if (bucket !== IMAGE_BUCKET && bucket !== DOCUMENT_BUCKET) continue;
    byBucket.set(bucket, [...(byBucket.get(bucket) ?? []), decodeURIComponent(path)]);
  }

  await Promise.all(
    Array.from(byBucket.entries()).map(async ([bucket, paths]) => {
      const { error } = await supabase.storage.from(bucket).remove(paths);
      if (error) console.warn('Storage cleanup failed:', error);
    }),
  );
}

export async function removeFiles(bucket: string, paths: string[]) {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) console.warn('Storage cleanup failed:', error);
}
