import { MetricCard } from "@/components/metric-card";
import {
  RevenueChart,
  CategoryMixChart,
  TopProductsChart,
} from "@/components/revenue-chart";
import { getDashboardData } from "@/lib/queries";

export const dynamic = "force-dynamic";

const iconClass = "h-[18px] w-[18px]";

const revenueIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={iconClass}
    aria-hidden
  >
    <path d="M12 2v20" />
    <path d="M17 7H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H7" />
  </svg>
);

const profitIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={iconClass}
    aria-hidden
  >
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M14 7h7v7" />
  </svg>
);

const orderIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={iconClass}
    aria-hidden
  >
    <path d="M3 3h2l2.4 12.3A2 2 0 0 0 9.4 17H17a2 2 0 0 0 2-1.6L20.5 8H6" />
    <circle cx="9" cy="20" r="1" />
    <circle cx="17" cy="20" r="1" />
  </svg>
);

const customerIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={iconClass}
    aria-hidden
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const SAR = (n: number) =>
  `SAR ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

const trendOf = (n: number): "up" | "down" | "flat" =>
  Math.abs(n) < 0.05 ? "flat" : n > 0 ? "up" : "down";

const statusBadge: Record<string, string> = {
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Processing: "border-amber-200 bg-amber-50 text-amber-800",
  Shipped: "border-sky-200 bg-sky-50 text-sky-800",
  Returned: "border-rose-200 bg-rose-50 text-rose-800",
};

export default async function DashboardPage() {
  const data = await getDashboardData();
  const { totals, trends, monthly, categories, topProducts, lowStock, feedback, recentSales } = data;

  const cards = [
    {
      title: "Total Revenue",
      value: SAR(totals.revenue),
      change: pct(trends.revenueChangePct),
      trend: trendOf(trends.revenueChangePct),
      period: "all completed sales",
      caption: `${totals.completedOrders.toLocaleString()} completed orders`,
      icon: revenueIcon,
    },
    {
      title: "Net Profit",
      value: SAR(totals.profit),
      change: pct(trends.profitChangePct),
      trend: trendOf(trends.profitChangePct),
      period: `${totals.grossMargin.toFixed(1)}% margin`,
      caption: `Expenses ${SAR(totals.expenses)}`,
      icon: profitIcon,
    },
    {
      title: "Avg Order Value",
      value: SAR(totals.averageOrder),
      change: pct(trends.averageOrderChangePct),
      trend: trendOf(trends.averageOrderChangePct),
      period: "month over month",
      caption: `${totals.totalOrders} total orders`,
      icon: orderIcon,
    },
    {
      title: "Customers",
      value: totals.customers.toLocaleString(),
      change: undefined,
      trend: undefined,
      period: "registered loyalty base",
      caption: `${totals.activeProducts} of ${totals.products} products active`,
      icon: customerIcon,
    },
  ] as const;

  return (
    <div className="px-12 py-12">
      <header className="mb-12 max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
          Dashboard · Live from Supabase
        </p>
        <h1 className="mt-3 font-serif text-5xl leading-tight tracking-tight text-ink">
          Great Numbers.
          <br />
          <span className="italic text-muted">No Nonsense.</span>
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-foreground/80">
          A clean, honest view of how the workspace is performing — sales,
          expenses, inventory, and customer feedback, straight from the database.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>

      <div className="mt-8">
        <RevenueChart data={monthly} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <CategoryMixChart data={categories} />
        <TopProductsChart data={topProducts} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <section className="rounded-md border border-rule bg-surface p-6 shadow-[0_1px_0_rgba(28,26,26,0.04),0_8px_24px_-12px_rgba(28,26,26,0.12)] xl:col-span-2">
          <header className="mb-4 flex items-end justify-between border-b border-rule pb-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
                Recent Sales
              </p>
              <h3 className="mt-1 font-serif text-xl tracking-tight text-ink">
                Latest activity
              </h3>
            </div>
            <span className="text-xs text-muted">Showing {recentSales.length}</span>
          </header>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Product</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4 text-right">Amount</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((s) => (
                  <tr key={s.id} className="border-t border-rule/70 align-top">
                    <td className="py-3 pr-4 font-mono text-[12px] text-foreground/80">
                      {s.sale_date}
                    </td>
                    <td className="py-3 pr-4 text-foreground">
                      {s.customer_name ?? (
                        <span className="italic text-muted">Walk-in</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-ink">{s.product}</td>
                    <td className="py-3 pr-4 text-foreground/80">{s.category}</td>
                    <td className="py-3 pr-4 text-right font-serif text-ink">
                      {SAR(Number(s.amount_sar ?? 0))}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                          statusBadge[s.status ?? ""] ?? "border-rule bg-surface text-muted"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-md border border-rule bg-surface p-6 shadow-[0_1px_0_rgba(28,26,26,0.04),0_8px_24px_-12px_rgba(28,26,26,0.12)]">
          <header className="mb-4 flex items-end justify-between border-b border-rule pb-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
                Operations
              </p>
              <h3 className="mt-1 font-serif text-xl tracking-tight text-ink">
                Heads up
              </h3>
            </div>
          </header>

          <div className="space-y-5 text-sm">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Low Stock
                </span>
                <span className="font-serif text-ink">{totals.lowStockCount}</span>
              </div>
              <ul className="mt-2 space-y-1.5">
                {lowStock.slice(0, 5).map((item) => (
                  <li
                    key={item.product_id}
                    className="flex items-center justify-between rounded-md border border-rule/80 bg-background px-3 py-2"
                  >
                    <div>
                      <p className="text-ink">{item.product_name}</p>
                      <p className="text-[11px] text-muted">
                        {item.category} · {item.warehouse_location}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        item.in_stock === 0 ? "text-rose-700" : "text-amber-700"
                      }`}
                    >
                      {item.in_stock} / {item.reorder_level}
                    </span>
                  </li>
                ))}
                {lowStock.length === 0 ? (
                  <li className="text-xs italic text-muted">
                    All products above reorder level.
                  </li>
                ) : null}
              </ul>
            </div>

            <div className="border-t border-rule pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Customer Feedback
                </span>
                <span className="font-serif text-ink">
                  {feedback.averageRating.toFixed(2)} ★
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {feedback.total} reviews · {feedback.pending} pending response
              </p>
              <ul className="mt-3 space-y-1">
                {feedback.ratingDistribution
                  .slice()
                  .reverse()
                  .map((r) => {
                    const max = Math.max(
                      ...feedback.ratingDistribution.map((d) => d.count),
                      1,
                    );
                    const w = (r.count / max) * 100;
                    return (
                      <li
                        key={r.rating}
                        className="flex items-center gap-2 text-xs text-foreground/80"
                      >
                        <span className="w-6 font-mono text-muted">
                          {r.rating}★
                        </span>
                        <span className="relative h-2 flex-1 overflow-hidden rounded-sm bg-foreground/[0.06]">
                          <span
                            className="absolute inset-y-0 left-0 bg-ink"
                            style={{ width: `${w}%` }}
                          />
                        </span>
                        <span className="w-6 text-right font-mono text-muted">
                          {r.count}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
