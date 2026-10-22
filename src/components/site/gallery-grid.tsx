'use client';
import * as React from 'react';
import Image from 'next/image';
import { Expand } from 'lucide-react';
import { BLUR_DATA_URL } from '@/lib/site';
import { cn } from '@/lib/utils';
import type { GaleriaItem } from '@/lib/types';
import dynamic from 'next/dynamic';

// Loaded only when a photo is opened: keeps the zoom viewer out of the first-load JavaScript.
const Lightbox = dynamic(() => import('./lightbox').then((m) => m.Lightbox), { ssr: false });

// Mosaic rhythm (desktop): large tile, two small, wide tile… repeats every 8 photos.
const SPANS = [
  'lg:col-span-2 lg:row-span-2',
  '',
  '',
  'lg:col-span-2',
  '',
  'lg:col-span-2 lg:row-span-2',
  '',
  'lg:col-span-2',
];

export function GalleryGrid({ items }: { items: GaleriaItem[] }) {
  const [index, setIndex] = React.useState<number | null>(null);
  const images = React.useMemo(
    () => items.map((i) => ({ src: i.imagem_url, alt: i.alt, caption: i.legenda })),
    [items],
  );

  return (
    <>
      <ul className="grid auto-rows-[9.5rem] grid-cols-2 gap-2.5 sm:auto-rows-[13rem] sm:gap-4 lg:grid-flow-dense lg:auto-rows-[12rem] lg:grid-cols-4">
        {items.map((item, i) => (
          <li
            key={item.id}
            className={cn('relative', SPANS[i % SPANS.length], i >= 4 && 'hidden sm:block')}
          >
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ampliar foto: ${item.legenda ?? item.alt}`}
              className="group bg-sand shadow-soft relative block size-full overflow-hidden rounded-[10px]"
            >
              <Image
                src={item.imagem_url}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 50vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <span
                aria-hidden
                className="from-brand-green-dark/75 absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100"
              />
              {item.legenda ? (
                <span className="font-heading absolute inset-x-3 bottom-2.5 text-left text-[0.82rem] leading-tight font-semibold text-white sm:text-sm">
                  {item.legenda}
                </span>
              ) : null}
              <span
                aria-hidden
                className="text-brand-green absolute top-2.5 right-2.5 grid size-9 place-items-center rounded-full bg-white/90 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <Expand className="size-4" />
              </span>
            </button>
          </li>
        ))}
      </ul>
      {index !== null ? (
        <Lightbox
          images={images}
          index={index}
          onIndexChange={setIndex}
          onClose={() => setIndex(null)}
        />
      ) : null}
    </>
  );
}
