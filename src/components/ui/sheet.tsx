'use client';
import * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

function SheetContent({
  className,
  children,
  side = 'right',
  title,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: 'right' | 'left' | 'bottom';
  title: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-brand-green-dark/60 fixed inset-0 z-50 backdrop-blur-[2px]" />
      <DialogPrimitive.Content
        aria-describedby={undefined}
        className={cn(
          'data-[state=open]:animate-in data-[state=closed]:animate-out bg-offwhite shadow-lift fixed z-50 flex flex-col duration-300',
          side === 'right' &&
            'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 w-[min(88vw,22rem)]',
          side === 'left' &&
            'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 w-[min(88vw,22rem)]',
          side === 'bottom' &&
            'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 max-h-[88dvh] rounded-t-2xl',
          className,
        )}
        {...props}
      >
        <div className="border-line flex items-center justify-between border-b px-5 py-3">
          <DialogPrimitive.Title className="font-heading text-brand-green text-base font-semibold">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close
            className="text-brand-green hover:bg-brand-green/10 grid size-11 place-items-center rounded-full"
            aria-label="Fechar"
          >
            <X className="size-5" aria-hidden />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent };
