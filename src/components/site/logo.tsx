import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({
  variant = 'color',
  className,
  priority = false,
}: {
  variant?: 'color' | 'white';
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={variant === 'white' ? '/brand/logo-white.svg' : '/brand/logo.svg'}
      alt="Art Terra — Pisos, Vasos e Revestimentos"
      width={244}
      height={122}
      unoptimized
      priority={priority}
      className={cn('h-12 w-auto', className)}
    />
  );
}
