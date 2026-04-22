export default function SettingsPage() {
  return (
    <div className="px-12 py-12">
      <header className="mb-12 max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
          Settings
        </p>
        <h1 className="mt-3 font-serif text-5xl leading-tight tracking-tight text-ink">
          Tune it, <span className="italic text-muted">your way.</span>
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-foreground/80">
          Manage workspace and account preferences.
        </p>
      </header>

      <div className="rounded-md border border-rule bg-surface p-10 text-foreground/70 shadow-[0_1px_0_rgba(28,26,26,0.04),0_8px_24px_-12px_rgba(28,26,26,0.12)]">
        <p className="font-serif text-lg italic">Settings will appear here.</p>
      </div>
    </div>
  );
}
