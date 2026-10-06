'use client';
import * as React from 'react';
import { Switch as SwitchPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'peer data-[state=checked]:bg-brand-green relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 border-transparent bg-[#c5c9c3] transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        // enlarge the touch target without changing the visual size
        'after:absolute after:-inset-2.5 after:content-[""]',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-5.5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[1.35rem]" />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
