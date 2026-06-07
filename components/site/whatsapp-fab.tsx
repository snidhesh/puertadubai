import {cn} from '@/lib/utils';

const WHATSAPP_NUMBER = '971544402792';

/**
 * Sticky WhatsApp action — bottom-right on LTR, bottom-left on RTL via
 * logical positioning (`end-*`). The persistent surface from the old
 * site, kept for continuity with the existing audience.
 */
export function WhatsAppFab({className}: {className?: string}) {
  const href = `https://wa.me/${WHATSAPP_NUMBER}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className={cn(
        'fixed bottom-6 end-6 z-40',
        'flex h-14 w-14 items-center justify-center rounded-full',
        'bg-[var(--accent)] text-[var(--text-on-dark)]',
        'shadow-lg transition-colors duration-200 hover:bg-[var(--hover)]',
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        className="h-7 w-7"
        fill="currentColor"
      >
        <path d="M20.52 3.48A11.85 11.85 0 0 0 12.03 0C5.45 0 .12 5.34.12 11.93c0 2.1.55 4.15 1.59 5.96L0 24l6.31-1.65a11.9 11.9 0 0 0 5.71 1.46h.01c6.58 0 11.92-5.34 11.92-11.93 0-3.18-1.24-6.17-3.43-8.4ZM12.03 21.6h-.01a9.62 9.62 0 0 1-4.9-1.34l-.35-.21-3.74.98 1-3.65-.23-.37a9.6 9.6 0 0 1-1.5-5.07c0-5.32 4.34-9.65 9.7-9.65a9.63 9.63 0 0 1 6.85 2.83 9.55 9.55 0 0 1 2.83 6.83c0 5.32-4.34 9.65-9.65 9.65Zm5.46-7.21c-.3-.15-1.78-.88-2.06-.98-.27-.1-.47-.15-.67.15-.2.3-.78.98-.95 1.18-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5a9.13 9.13 0 0 1-1.68-2.08c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.2 3.08c.15.2 2.1 3.21 5.08 4.5.71.3 1.27.48 1.7.61.71.23 1.36.2 1.87.12.57-.08 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.07-.13-.27-.2-.57-.35Z" />
      </svg>
    </a>
  );
}
