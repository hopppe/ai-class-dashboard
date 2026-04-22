import { MetricCard } from "@/components/metric-card";
import { RevenueChart } from "@/components/revenue-chart";
import {
  metrics,
  monthlyRevenue,
  weeklyCustomers,
  reports,
} from "../../frontend-sample-data";

const priorMonthsRevenue = [
  { month: "Mar 2025", revenue: 92500 },
  { month: "Apr 2025", revenue: 98200 },
  { month: "May 2025", revenue: 104100 },
  { month: "Jun 2025", revenue: 109800 },
  { month: "Jul 2025", revenue: 112400 },
  { month: "Aug 2025", revenue: 115300 },
];

const twelveMonthRevenue = [
  ...priorMonthsRevenue,
  ...monthlyRevenue.map(({ month, revenue }) => ({ month, revenue })),
];

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

const usersIcon = (
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

const trendingIcon = (
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

const sparklesIcon = (
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
    <path d="M12 3l1.8 4.6L18 9.4l-4.2 1.8L12 16l-1.8-4.8L6 9.4l4.2-1.8z" />
    <path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9z" />
    <path d="M5 4l.6 1.4L7 6l-1.4.6L5 8l-.6-1.4L3 6l1.4-.6z" />
  </svg>
);

function computeGrowthRate(): string {
  const first = monthlyRevenue[0].revenue;
  const last = monthlyRevenue[monthlyRevenue.length - 1].revenue;
  const pct = ((last - first) / first) * 100;
  return `${pct.toFixed(1)}%`;
}

function computeActiveUsers(): string {
  const latest = weeklyCustomers[weeklyCustomers.length - 1].customers;
  return latest.toLocaleString();
}

const cards = [
  {
    title: "Total Revenue",
    value: metrics[0].value,
    change: metrics[0].change,
    trend: "up" as const,
    period: metrics[0].period,
    icon: revenueIcon,
  },
  {
    title: "Active Users",
    value: computeActiveUsers(),
    change: "+6.4%",
    trend: "up" as const,
    period: "weekly visitors",
    icon: usersIcon,
  },
  {
    title: "Growth Rate",
    value: computeGrowthRate(),
    change: "+2.8%",
    trend: "up" as const,
    period: "6-month revenue",
    icon: trendingIcon,
  },
  {
    title: "AI Insights",
    value: reports.length.toString(),
    change: "+3 new",
    trend: "up" as const,
    period: "this month",
    icon: sparklesIcon,
  },
];

export default function DashboardPage() {
  return (
    <div className="px-12 py-12">
      <header className="mb-12 max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
          Dashboard
        </p>
        <h1 className="mt-3 font-serif text-5xl leading-tight tracking-tight text-ink">
          Great Numbers.
          <br />
          <span className="italic text-muted">No Nonsense.</span>
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-foreground/80">
          A clean, honest view of how the workspace is performing this period.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>

      <div className="mt-8">
        <RevenueChart data={twelveMonthRevenue} />
      </div>
    </div>
  );
}
