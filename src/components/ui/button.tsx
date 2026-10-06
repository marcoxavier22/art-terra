import * as React from 'react';
import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[10px] font-heading font-semibold whitespace-nowrap transition-[background-color,color,border-color,box-shadow,transform] duration-200 select-none disabled:pointer-events-none disabled:opacity-55 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-orange text-brand-green-dark shadow-soft hover:bg-brand-orange-dark hover:text-white',
        green: 'bg-brand-green text-white shadow-soft hover:bg-brand-green-dark',
        whatsapp: 'bg-whatsapp text-[#06281a] shadow-soft hover:bg-whatsapp-dark',
        outline:
          'border-2 border-brand-green/25 bg-white text-brand-green hover:border-brand-green hover:bg-brand-green hover:text-white',
        outlineLight:
          'border-2 border-white bg-white/[0.08] text-white backdrop-blur-sm hover:bg-white hover:text-brand-green-dark',
        ghost: 'text-brand-green hover:bg-brand-green/10',
        danger: 'bg-danger text-white hover:bg-[#8f1c13]',
        dangerOutline: 'border-2 border-danger/30 bg-white text-danger hover:bg-danger/10',
        link: 'h-auto min-h-0 rounded-none p-0 text-brand-green underline-offset-4 hover:underline',
      },
      size: {
        sm: 'min-h-10 px-3.5 text-sm [&_svg]:size-4',
        md: 'min-h-11 px-5 text-[0.95rem] [&_svg]:size-[1.15rem]',
        lg: 'min-h-13 px-7 text-base [&_svg]:size-5',
        icon: 'size-11 [&_svg]:size-5',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...(asChild ? {} : { type: type ?? 'button' })}
      {...props}
    />
  );
}

export { Button, buttonVariants };
