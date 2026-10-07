'use client';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/text';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PDF_BYTES = 25 * 1024 * 1024;
const MAX_SIDE = 1600;
const WEBP_QUALITY = 0.82;
const ACCEPTED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export class UploadError extends Error {}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      // honours EXIF rotation from phone cameras
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      /* fall through to <img> decoding */
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new UploadError('Não foi possível ler esta imagem. Tente outro arquivo.'));
    };
    img.src = url;
  });
}

/** Resizes to at most 1600px on the longest side and re-encodes as WebP (~0.82), in the browser. */
export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) {
    throw new UploadError('Envie um arquivo de imagem (JPG, PNG ou WebP).');
  }
  if (file.size > 40 * 1024 * 1024) {
    throw new UploadError('Esta foto é grande demais (mais de 40 MB). Escolha outra.');
  }
  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await decode(file);
  } catch (error) {
    if (ACCEPTED_IMAGES.includes(file.type) && file.size <= MAX_IMAGE_BYTES) return file;
    throw error instanceof UploadError
      ? error
      : new UploadError('Não foi possível ler esta imagem. Tente outro arquivo.');
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(source.width, source.height));
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new UploadError('Seu navegador não conseguiu preparar a imagem.');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);
  if ('close' in source) source.close();

  const toBlob = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  // Safari < 16 cannot encode WebP and silently returns PNG: fall back to JPEG there.
  let blob = await toBlob('image/webp', WEBP_QUALITY);
  if (!blob || blob.type !== 'image/webp') blob = await toBlob('image/jpeg', 0.85);
  if (!blob) throw new UploadError('Seu navegador não conseguiu preparar a imagem.');
  if (blob.size > MAX_IMAGE_BYTES) {
    throw new UploadError('A imagem ficou acima de 5 MB mesmo após a compressão.');
  }
  return blob;
}

function extensionFor(type: string): string {
  if (type === 'image/webp') return 'webp';
  if (type === 'image/jpeg') return 'jpg';
  if (type === 'image/png') return 'png';
  if (type === 'image/avif') return 'avif';
  if (type === 'application/pdf') return 'pdf';
  return 'bin';
}

export type Folder = 'produtos' | 'categorias' | 'galeria' | 'site';

/**
 * Uploads straight from the browser to Supabase Storage with the admin's session
 * (the storage policies only accept admins). XHR is used to report real progress.
 */
export async function uploadFile(options: {
  bucket: 'produtos' | 'documentos';
  folder: Folder | 'catalogo';
  baseName: string;
  blob: Blob;
  onProgress?: (percent: number) => void;
}): Promise<string> {
  const { bucket, folder, baseName, blob, onProgress } = options;
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new UploadError('Sua sessão expirou. Entre novamente.');

  const safe = slugify(baseName) || 'arquivo';
  const path = `${folder}/${safe}-${Date.now()}.${extensionFor(blob.type)}`;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/+$/, '');

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${base}/storage/v1/object/${bucket}/${path}`);
    xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
    xhr.setRequestHeader('apikey', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    xhr.setRequestHeader('Content-Type', blob.type);
    xhr.setRequestHeader('Cache-Control', 'max-age=31536000');
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      if (xhr.status === 413) return reject(new UploadError('Arquivo acima do tamanho permitido.'));
      if (xhr.status === 415) return reject(new UploadError('Tipo de arquivo não permitido.'));
      if (xhr.status === 401 || xhr.status === 403) {
        return reject(new UploadError('Você não tem permissão para enviar arquivos.'));
      }
      reject(new UploadError('Falha no envio. Verifique a internet e tente de novo.'));
    };
    xhr.onerror = () =>
      reject(new UploadError('Falha no envio. Verifique a internet e tente de novo.'));
    xhr.send(blob);
  });

  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

/** Compress + upload an image; returns its public URL. */
export async function uploadImage(
  file: File,
  folder: Folder,
  baseName: string,
  onProgress?: (percent: number) => void,
): Promise<string> {
  onProgress?.(3);
  const blob = await compressImage(file);
  onProgress?.(12);
  return uploadFile({
    bucket: 'produtos',
    folder,
    baseName,
    blob,
    onProgress: (p) => onProgress?.(12 + Math.round(p * 0.88)),
  });
}

/** Deletes a file that was uploaded but never saved (e.g. the user removed it again). */
export async function discardUpload(url: string | null | undefined) {
  if (!url) return;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/+$/, '');
  const prefix = `${base}/storage/v1/object/public/`;
  if (!url.startsWith(prefix)) return;
  const [bucket, ...rest] = decodeURIComponent(url.slice(prefix.length)).split('/');
  if (!rest.length) return;
  await createClient().storage.from(bucket).remove([rest.join('/')]);
}
