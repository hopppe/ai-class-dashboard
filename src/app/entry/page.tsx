import { SaleForm } from "@/components/sale-form";
import { getCustomerOptions, getProductOptions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EntryPage() {
  const [customers, products] = await Promise.all([
    getCustomerOptions(),
    getProductOptions(),
  ]);

  return (
    <div className="px-12 py-12">
      <header className="mb-10 max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
          New entry · Daily metrics
        </p>
        <h1 className="mt-3 font-serif text-5xl leading-tight tracking-tight text-ink">
          Record a sale, <span className="italic text-muted">today.</span>
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-foreground/80">
          Adds a row to the <code className="font-mono text-[13px] text-ink">sales</code>{" "}
          table in Supabase. The category and price autofill from the selected
          product, and every field is validated server-side.
        </p>
      </header>

      <section className="rounded-md border border-rule bg-surface p-8 shadow-[0_1px_0_rgba(28,26,26,0.04),0_8px_24px_-12px_rgba(28,26,26,0.12)]">
        <SaleForm customers={customers} products={products} />
      </section>

      <aside className="mt-6 rounded-md border border-dashed border-rule bg-background p-5 text-sm text-foreground/80">
        <p className="font-serif italic text-muted">
          Sales appear instantly on the dashboard and reports — both pages
          revalidate on save.
        </p>
      </aside>
    </div>
  );
}
