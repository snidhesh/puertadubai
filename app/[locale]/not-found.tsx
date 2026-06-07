import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-md">
        <p className="text-[12px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
          404
        </p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Not found</h1>
        <p className="mt-4 text-[var(--text-body)]">
          The page you were looking for could not be found.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-[45px] items-center justify-center border border-[var(--accent)] px-8 text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--text-on-dark)]"
          data-ui-label
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
