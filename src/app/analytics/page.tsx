import {
  RevenueChart,
  CategoryMixChart,
  TopProductsChart,
} from "@/components/revenue-chart";
import { getDashboardData } from "@/lib/queries";
import { cookies } from "next/headers";
import { ui, getLang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [{ monthly, categories, topProducts }, cookieStore] = await Promise.all(
    [getDashboardData(), cookies()],
  );
  const T = ui[getLang(cookieStore.get("lang")?.value)].analytics;

  return (
    <div className="px-12 py-12">
      <header className="mb-10 max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
          {T.overline}
        </p>
        <h1 className="mt-3 font-serif text-5xl leading-tight tracking-tight text-ink">
          {T.title} <span className="italic text-muted">{T.titleItalic}</span>
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-foreground/80">
          {T.subtitle}
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
