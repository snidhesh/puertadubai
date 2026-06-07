import {cva, type VariantProps} from 'class-variance-authority';
import {forwardRef, type ButtonHTMLAttributes} from 'react';
import {cn} from '@/lib/utils';

/**
 * Mahsheed-inspired button system: editorial UI uppercase by default (Latin).
 * Arabic pages override via `:root[lang="ar"] button` rules in globals.css
 * (text-transform: none, letter-spacing: 0) — so we never need locale-aware
 * className logic here.
 */
const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-medium uppercase tracking-[0.08em] text-[12px]',
    'transition-colors duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50'
  ),
  {
    variants: {
      variant: {
        ghost:
          'border border-[var(--accent)] bg-transparent text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--text-on-dark)]',
        solid:
          'border border-[var(--accent)] bg-[var(--accent)] text-[var(--text-on-dark)] hover:bg-[var(--hover)] hover:border-[var(--hover)]',
        link:
          'border-0 px-0 text-[var(--accent)] underline-offset-4 hover:underline tracking-[0.04em]'
      },
      size: {
        default: 'h-[45px] px-8',
        sm: 'h-[36px] px-5 text-[11px]',
        lg: 'h-[52px] px-10 text-[13px]',
        icon: 'h-[45px] w-[45px] px-0'
      }
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'default'
    }
  }
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({className, variant, size, ...props}, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({variant, size}), className)}
      data-ui-label
      {...props}
    />
  )
);
Button.displayName = 'Button';

export {buttonVariants};
