'use client';
import * as React from 'react';
import Image from 'next/image';
import { ZoomIn } from 'lucide-react';
import { BLUR_DATA_URL } from '@/lib/site';
import { cn } from '@/lib/utils';
import { Lightbox, type LightboxImage } from '@/components/site/lightbox';
import { ImagePlaceholder } from './product-image';

export function ProductGallery({ images, nome }: { images: LightboxImage[]; nome: string }) {
  const [selected, setSelected] = React.useState(0);
  const [lightbox, setLightbox] = React.useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="shadow-soft aspect-[4/3] overflow-hidden rounded-[12px]">
        <ImagePlaceholder label={nome} />
      </div>
    );
  }

  const current = images[Math.min(selected, images.length - 1)];

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightbox(selected)}
        aria-label={`Ampliar foto: ${current.alt}`}
        className="group bg-sand shadow-soft relative block aspect-[4/3] w-full overflow-hidden rounded-[12px]"
      >
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          quality={85}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className="object-cover"
        />
        <span
          aria-hidden
          className="text-brand-green absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-1.5 text-xs font-semibold shadow-sm"
        >
          <ZoomIn className="size-4" />
          Ampliar
        </span>
      </button>

      {images.length > 1 ? (
        <ul className="mt-3 grid grid-cols-4 gap-2.5 sm:grid-cols-5" aria-label="Fotos do produto">
          {images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                onClick={() => setSelected(i)}
                aria-label={`Ver foto ${i + 1}: ${img.caption ?? img.alt}`}
                aria-current={i === selected}
                className={cn(
                  'bg-sand relative block aspect-[4/3] w-full overflow-hidden rounded-lg border-2 transition-colors',
                  i === selected ? 'border-brand-orange' : 'hover:border-line border-transparent',
                )}
              >
                <Image
                  src={img.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 10vw, 25vw"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <Lightbox
        images={images}
        index={lightbox}
        onIndexChange={(i) => {
          setLightbox(i);
          setSelected(i);
        }}
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}
