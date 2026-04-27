import {
  RevenueChart,
  CategoryMixChart,
  TopProductsChart,
} from "@/components/revenue-chart";
import { getDashboardData } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const { monthly, categories, topProducts } = await getDashboardData();

  return (
    <div className="px-12 py-12">
      <header className="mb-10 max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
          Analytics
        </p>
        <h1 className="mt-3 font-serif text-5xl leading-tight tracking-tight text-ink">
          Numbers, <span className="italic text-muted">in plain sight.</span>
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-foreground/80">
          Trends, category mix and top performers — drawn from the live sales
          and expenses data.
        </p>
      </header>

      <RevenueChart data={monthly} />

      <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <CategoryMixChart data={categories} />
        <TopProductsChart data={topProducts} />
      </div>
    </div>
  );
}
