import Image from 'next/image';
import { BLUR_DATA_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

/** Brand placeholder shown when a product has no photo yet (never a broken image). */
export function ImagePlaceholder({ label, className }: { label?: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={label ? `${label} — foto em breve` : 'Foto em breve'}
      className={cn(
        'concrete-grain bg-brand-green flex size-full flex-col items-center justify-center gap-3 text-white/80',
        className,
      )}
    >
      <Image
        src="/brand/icon-white.svg"
        alt=""
        width={154}
        height={122}
        unoptimized
        className="h-14 w-auto opacity-90"
      />
      <span className="font-heading text-xs font-semibold tracking-[0.18em] uppercase">
        Foto em breve
      </span>
    </div>
  );
}

export function ProductImage({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) return <ImagePlaceholder label={alt} />;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      fetchPriority={priority ? 'high' : undefined}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      className={cn('object-cover', className)}
    />
  );
}
