'use client';
import * as React from 'react';
import Image from 'next/image';
import { Camera, ImagePlus, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { UploadError, uploadImage, type Folder } from '@/lib/admin/upload';
import { BLUR_DATA_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif';

export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-2 w-full overflow-hidden rounded-full bg-line"
    >
      <div
        className="h-full rounded-full bg-brand-orange transition-[width] duration-200"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

/** Picks one or many images (file dialog, drag & drop, or the phone camera) and uploads them. */
export function useImageUpload(folder: Folder, baseName: string) {
  const [progress, setProgress] = React.useState<number | null>(null);
  const upload = React.useCallback(
    async (files: File[]): Promise<string[]> => {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setProgress(1);
        try {
          const url = await uploadImage(files[i], folder, baseName || 'foto', (p) =>
            setProgress(Math.round((i * 100 + p) / files.length)),
          );
          urls.push(url);
        } catch (error) {
          toast.error(
            error instanceof UploadError ? error.message : 'Não foi possível enviar a foto.',
          );
        }
      }
      setProgress(null);
      return urls;
    },
    [folder, baseName],
  );
  return { progress, upload };
}

export function ImageUploader({
  label,
  hint,
  value,
  onChange,
  folder,
  baseName,
  aspect = 'aspect-[4/3]',
  id,
}: {
  label: string;
  hint?: string;
  value: string | null;
  onChange: (url: string | null) => void;
  folder: Folder;
  baseName: string;
  aspect?: string;
  id: string;
}) {
  const { progress, upload } = useImageUpload(folder, baseName);
  const [dragOver, setDragOver] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const cameraRef = React.useRef<HTMLInputElement>(null);
  const busy = progress !== null;

  async function handle(files: FileList | null) {
    if (!files?.length || busy) return;
    const [url] = await upload([files[0]]);
    if (url) onChange(url);
  }

  return (
    <div>
      <p id={`${id}-label`} className="mb-1.5 text-sm font-semibold text-ink">
        {label}
      </p>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handle(e.dataTransfer.files);
        }}
        className={cn(
          'relative overflow-hidden rounded-[12px] border-2 border-dashed bg-sand/60 transition-colors',
          aspect,
          dragOver ? 'border-brand-orange bg-brand-orange/10' : 'border-line',
        )}
      >
        {value ? (
          <Image
            src={value}
            alt={`Prévia: ${label}`}
            fill
            sizes="(min-width: 640px) 320px, 90vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="object-cover"
          />
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            aria-labelledby={`${id}-label`}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-muted hover:text-brand-green"
          >
            <ImagePlus className="size-9" aria-hidden />
            <span className="text-sm font-semibold">Toque para escolher a foto</span>
            <span className="hidden text-xs sm:block">ou arraste o arquivo para cá</span>
          </button>
        )}
        {busy ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/85 p-6">
            <Loader2 className="size-7 animate-spin text-brand-green" aria-hidden />
            <ProgressBar value={progress} label={`Enviando ${label}`} />
            <span className="text-sm font-semibold text-ink">Enviando… {progress}%</span>
          </div>
        ) : null}
      </div>

      <div className="mt-2.5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-line bg-white px-3.5 text-sm font-semibold text-brand-green hover:border-brand-green disabled:opacity-50"
        >
          {value ? <RefreshCw className="size-4" aria-hidden /> : <ImagePlus className="size-4" aria-hidden />}
          {value ? 'Trocar' : 'Escolher'}
        </button>
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          disabled={busy}
          className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-line bg-white px-3.5 text-sm font-semibold text-brand-green hover:border-brand-green disabled:opacity-50 lg:hidden"
        >
          <Camera className="size-4" aria-hidden />
          Tirar foto
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={busy}
            className="inline-flex min-h-11 items-center gap-2 rounded-[10px] px-3.5 text-sm font-semibold text-danger hover:bg-danger/8 disabled:opacity-50"
          >
            <Trash2 className="size-4" aria-hidden />
            Remover
          </button>
        ) : null}
      </div>
      {hint ? <p className="mt-1.5 text-sm text-muted">{hint}</p> : null}

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          void handle(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          void handle(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

export const IMAGE_ACCEPT = ACCEPT;
