import { getReportsData } from "@/lib/queries";
import { cookies } from "next/headers";
import { ui, getLang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const SAR = (n: number) =>
  `SAR ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const tierColor: Record<string, string> = {
  Platinum: "border-violet-300 bg-violet-50 text-violet-900",
  Gold: "border-amber-300 bg-amber-50 text-amber-900",
  Silver: "border-zinc-300 bg-zinc-50 text-zinc-900",
  Bronze: "border-orange-300 bg-orange-50 text-orange-900",
};

export default async function ReportsPage() {
  const [data, cookieStore] = await Promise.all([getReportsData(), cookies()]);
  const T = ui[getLang(cookieStore.get("lang")?.value)].reports;
  const {
    topCustomers,
    cityBreakdown,
    paymentMix,
    expenseByCategory,
    feedbackByProduct,
    returnsAndPending,
    monthly,
    totals,
  } = data;

  const totalOrders =
    returnsAndPending.completed +
    returnsAndPending.processing +
    returnsAndPending.returned +
    returnsAndPending.shipped;

  const summary = [
    { label: T.labelRevenue, value: SAR(totals.revenue) },
    { label: T.labelExpenses, value: SAR(totals.expenses) },
    { label: T.labelProfit, value: SAR(totals.profit) },
    { label: T.labelMargin, value: `${totals.grossMargin.toFixed(1)}%` },
  ];

  const bestMonth = monthly.length
    ? monthly.reduce((a, b) => (a.profit > b.profit ? a : b))
    : null;

  return (
    <div className="px-12 py-12">
      <header className="mb-12 max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
          {T.overline}
        </p>
        <h1 className="mt-3 font-serif text-5xl leading-tight tracking-tight text-ink">
          {T.title}{" "}
          <span className="italic text-muted">{T.titleItalic}</span>
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-foreground/80">
          {T.subtitle}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {summary.map((s) => (
          <div
            key={s.label}
            className="rounded-md border border-rule bg-surface p-5"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              {s.label}
            </p>
            <p className="mt-3 font-serif text-3xl tracking-tight text-ink">
              {s.value}
            </p>
          </div>
        ))}
      </section>

      <div className="mt-10 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ReportCard
          eyebrow={T.topCustomersEyebrow}
          title={T.topCustomersTitle}
          tagline={
            bestMonth
              ? `${bestMonth.month} was the best month at ${SAR(bestMonth.profit)} profit.`
              : ""
          }
        >
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                <th className="py-2 pr-3">{T.colName}</th>
                <th className="py-2 pr-3">{T.colCity}</th>
                <th className="py-2 pr-3">{T.colTier}</th>
                <th className="py-2 pr-3 text-right">{T.colLifetimeSpend}</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((c) => (
                <tr key={c.name} className="border-t border-rule/70">
                  <td className="py-2.5 pr-3 text-ink">{c.name}</td>
                  <td className="py-2.5 pr-3 text-foreground/80">{c.city}</td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                        tierColor[c.tier] ?? "border-rule bg-surface text-muted"
                      }`}
                    >
                      {c.tier}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-right font-serif text-ink">
                    {SAR(c.spent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ReportCard>

        <ReportCard eyebrow={T.geoEyebrow} title={T.geoTitle}>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                <th className="py-2 pr-3">{T.colCity}</th>
                <th className="py-2 pr-3 text-right">{T.colCustomers}</th>
                <th className="py-2 pr-3 text-right">{T.colLifetimeSpend}</th>
              </tr>
            </thead>
            <tbody>
              {cityBreakdown.map((c) => (
                <tr key={c.city} className="border-t border-rule/70">
                  <td className="py-2.5 pr-3 text-ink">{c.city}</td>
                  <td className="py-2.5 pr-3 text-right font-mono text-foreground/80">
                    {c.customers}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-serif text-ink">
                    {SAR(c.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ReportCard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ReportCard eyebrow={T.cashEyebrow} title={T.cashTitle}>
          <ul className="space-y-2.5 text-sm">
            {expenseByCategory.map((e) => (
              <li key={e.category}>
                <div className="flex items-center justify-between">
                  <span className="text-ink">{e.category}</span>
                  <span className="font-serif text-ink">{SAR(e.amount)}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-foreground/[0.06]">
                  <span
                    className="block h-full bg-ink"
                    style={{ width: `${Math.min(100, e.share)}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted">{T.ofSpend(e.share.toString())}</p>
              </li>
            ))}
          </ul>
        </ReportCard>

        <ReportCard eyebrow={T.channelEyebrow} title={T.channelTitle}>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                <th className="py-2 pr-3">{T.colMethod}</th>
                <th className="py-2 pr-3 text-right">{T.colOrders}</th>
                <th className="py-2 pr-3 text-right">{T.colRevenue}</th>
              </tr>
            </thead>
            <tbody>
              {paymentMix.map((p) => (
                <tr key={p.method} className="border-t border-rule/70">
                  <td className="py-2.5 pr-3 text-ink">{p.method}</td>
                  <td className="py-2.5 pr-3 text-right font-mono text-foreground/80">
                    {p.orders}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-serif text-ink">
                    {SAR(p.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ReportCard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ReportCard
          eyebrow={T.voiceEyebrow}
          title={T.voiceTitle}
          tagline={T.voiceTagline}
        >
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                <th className="py-2 pr-3">{T.colProduct}</th>
                <th className="py-2 pr-3 text-right">{T.colAvgRating}</th>
                <th className="py-2 pr-3 text-right">{T.colReviews}</th>
                <th className="py-2 pr-3 text-right">{T.colPending}</th>
              </tr>
            </thead>
            <tbody>
              {feedbackByProduct.map((p) => (
                <tr key={p.product} className="border-t border-rule/70">
                  <td className="py-2.5 pr-3 text-ink">{p.product}</td>
                  <td
                    className={`py-2.5 pr-3 text-right font-serif ${
                      p.averageRating < 3 ? "text-rose-700" : "text-ink"
                    }`}
                  >
                    {p.averageRating.toFixed(2)}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono text-foreground/80">
                    {p.count}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono text-foreground/80">
                    {p.pending}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ReportCard>

        <ReportCard
          eyebrow={T.pipelineEyebrow}
          title={T.pipelineTitle}
          tagline={T.pipelineTagline(totalOrders)}
        >
          <ul className="space-y-3 text-sm">
            {(
              [
                [T.statusCompleted, returnsAndPending.completed, "bg-emerald-600"],
                [T.statusShipped, returnsAndPending.shipped, "bg-sky-600"],
                [T.statusProcessing, returnsAndPending.processing, "bg-amber-600"],
                [T.statusReturned, returnsAndPending.returned, "bg-rose-600"],
              ] as [string, number, string][]
            ).map(([label, count, color]) => {
              const w = totalOrders === 0 ? 0 : (count / totalOrders) * 100;
              return (
                <li key={label}>
                  <div className="flex items-center justify-between">
                    <span className="text-ink">{label}</span>
                    <span className="font-mono text-foreground/80">
                      {count.toLocaleString()}{" "}
                      <span className="text-muted">({w.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-foreground/[0.06]">
                    <span
                      className={`block h-full ${color}`}
                      style={{ width: `${w}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </ReportCard>
      </div>
    </div>
  );
}

function ReportCard({
  eyebrow,
  title,
  tagline,
  children,
}: {
  eyebrow: string;
  title: string;
  tagline?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-rule bg-surface p-7 shadow-[0_1px_0_rgba(28,26,26,0.04),0_8px_24px_-12px_rgba(28,26,26,0.12)]">
      <header className="mb-5 border-b border-rule pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
          {eyebrow}
        </p>
        <h3 className="mt-1 font-serif text-2xl tracking-tight text-ink">
          {title}
        </h3>
        {tagline ? (
          <p className="mt-1 text-sm italic text-muted">{tagline}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
