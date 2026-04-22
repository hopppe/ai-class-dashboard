type Trend = "up" | "down";

type MetricCardProps = {
  title: string;
  value: string;
  change: string;
  trend: Trend;
  period: string;
  icon: React.ReactNode;
};

const trendArrow = (trend: Trend) =>
  trend === "up" ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
      aria-hidden
    >
      <path d="M7 17l9-9" />
      <path d="M8 7h8v8" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
      aria-hidden
    >
      <path d="M7 7l9 9" />
      <path d="M16 17H8V9" />
    </svg>
  );

export function MetricCard({
  title,
  value,
  change,
  trend,
  period,
  icon,
}: MetricCardProps) {
  const trendClass = trend === "up" ? "text-emerald-700" : "text-rose-700";

  return (
    <div className="group relative rounded-md border border-rule bg-surface p-6 shadow-[0_1px_0_rgba(28,26,26,0.04),0_8px_24px_-12px_rgba(28,26,26,0.12)] transition-shadow duration-300 hover:shadow-[0_2px_0_rgba(28,26,26,0.06),0_18px_36px_-16px_rgba(28,26,26,0.18)]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          {title}
        </span>
        <span className="text-muted">{icon}</span>
      </div>

      <p className="mt-5 font-serif text-[34px] leading-none tracking-tight text-ink">
        {value}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-rule pt-3 text-xs">
        <span className={`inline-flex items-center gap-1 font-medium ${trendClass}`}>
          {trendArrow(trend)}
          {change}
        </span>
        <span className="font-serif italic text-muted">{period}</span>
      </div>
    </div>
  );
}
