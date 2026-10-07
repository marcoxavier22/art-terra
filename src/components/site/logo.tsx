import Image from 'next/image';
import { cn } from '@/lib/utils';

/** Full stacked logo (as in the printed catalogue). Best on large sizes, e.g. the footer. */
export function Logo({
  variant = 'color',
  className,
}: {
  variant?: 'color' | 'white';
  className?: string;
}) {
  return (
    <Image
      src={variant === 'white' ? '/brand/logo-white.svg' : '/brand/logo.svg'}
      alt="Art Terra — Pisos, Vasos e Revestimentos"
      width={244}
      height={122}
      unoptimized
      className={cn('h-16 w-auto', className)}
    />
  );
}

/**
 * Horizontal lockup for the header: the brand mark plus the name set in live text,
 * so "ART TERRA" stays crisp and readable at 68px of header height.
 */
export function LogoLockup({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <Image
        src="/brand/icon.svg"
        alt=""
        width={154}
        height={122}
        unoptimized
        priority
        className="h-11 w-auto sm:h-12"
      />
      <span className="flex flex-col leading-none">
        <span className="font-heading text-brand-green text-[1.3rem] font-extrabold tracking-tight sm:text-[1.45rem]">
          ART TERRA
        </span>
        <span className="font-heading text-brand-green/80 mt-1 hidden text-[0.56rem] font-semibold tracking-[0.2em] uppercase min-[400px]:block md:hidden lg:block">
          Pisos · Vasos · Revestimentos
        </span>
      </span>
    </span>
  );
}
