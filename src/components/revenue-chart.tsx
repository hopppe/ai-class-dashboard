"use client";

import {
  CartesianGrid,
  Bar,
  BarChart,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

type Point = {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
};

type Props = {
  data: Point[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

type TooltipProps = {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: Point;
    name: string;
    dataKey: string;
    color: string;
  }>;
  label?: string;
};

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-md border border-rule bg-surface px-3 py-2 text-xs shadow-[0_8px_24px_-12px_rgba(28,26,26,0.2)]">
      <p className="font-medium uppercase tracking-[0.14em] text-muted text-[10px]">
        {label}
      </p>
      <ul className="mt-2 space-y-1">
        {payload.map((p) => (
          <li key={p.dataKey} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ background: p.color }}
            />
            <span className="text-muted capitalize">{p.name}</span>
            <span className="ml-auto font-serif text-ink">
              SAR {p.value.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RevenueChart({ data }: Props) {
  return (
    <div className="rounded-md border border-rule bg-surface p-8 shadow-[0_1px_0_rgba(28,26,26,0.04),0_8px_24px_-12px_rgba(28,26,26,0.12)]">
      <div className="mb-8 flex items-end justify-between border-b border-rule pb-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
            P&amp;L Overview
          </p>
          <h2 className="mt-2 font-serif text-2xl tracking-tight text-ink">
            Revenue, expenses &amp; profit{" "}
            <span className="italic text-muted">by month</span>
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="inline-flex items-center gap-2">
            <span className="h-px w-4 bg-ink" />
            <span className="uppercase tracking-[0.14em]">Profit</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-sm bg-[#3f3a36]" />
            <span className="uppercase tracking-[0.14em]">Revenue</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-sm bg-[#c2bbb0]" />
            <span className="uppercase tracking-[0.14em]">Expenses</span>
          </span>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="2 4"
              stroke="#d9d6cc"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              stroke="#a8a39c"
              tickLine={false}
              axisLine={{ stroke: "#d9d6cc" }}
              tick={{ fill: "#6b6562", fontSize: 11 }}
              tickMargin={10}
            />
            <YAxis
              stroke="#a8a39c"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6b6562", fontSize: 11 }}
              tickFormatter={formatCurrency}
              width={56}
            />
            <Tooltip
              cursor={{ fill: "rgba(28,26,26,0.04)" }}
              content={<ChartTooltip />}
            />
            <Legend wrapperStyle={{ display: "none" }} />
            <Bar dataKey="revenue" name="Revenue" fill="#3f3a36" radius={[2, 2, 0, 0]} barSize={14} />
            <Bar dataKey="expenses" name="Expenses" fill="#c2bbb0" radius={[2, 2, 0, 0]} barSize={14} />
            <Line
              type="monotone"
              dataKey="profit"
              name="Profit"
              stroke="#1c1a1a"
              strokeWidth={1.75}
              dot={{ r: 3, fill: "#1c1a1a", strokeWidth: 0 }}
              activeDot={{
                r: 5,
                fill: "#fbfaf4",
                stroke: "#1c1a1a",
                strokeWidth: 2,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

type CategoryDatum = { category: string; revenue: number; orders: number };

export function CategoryMixChart({ data }: { data: CategoryDatum[] }) {
  return (
    <div className="rounded-md border border-rule bg-surface p-8 shadow-[0_1px_0_rgba(28,26,26,0.04),0_8px_24px_-12px_rgba(28,26,26,0.12)]">
      <div className="mb-6 border-b border-rule pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
          Sales by Category
        </p>
        <h2 className="mt-2 font-serif text-2xl tracking-tight text-ink">
          Revenue mix{" "}
          <span className="italic text-muted">across the catalog</span>
        </h2>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="2 4"
              stroke="#d9d6cc"
              horizontal={false}
            />
            <XAxis
              type="number"
              stroke="#a8a39c"
              tickLine={false}
              axisLine={{ stroke: "#d9d6cc" }}
              tick={{ fill: "#6b6562", fontSize: 11 }}
              tickFormatter={formatCurrency}
            />
            <YAxis
              type="category"
              dataKey="category"
              stroke="#a8a39c"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#1c1a1a", fontSize: 12 }}
              width={120}
            />
            <Tooltip cursor={{ fill: "rgba(28,26,26,0.04)" }} content={<ChartTooltip />} />
            <Bar dataKey="revenue" name="Revenue" fill="#1c1a1a" radius={[0, 2, 2, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

type TopProductDatum = { product: string; revenue: number; units: number };

export function TopProductsChart({ data }: { data: TopProductDatum[] }) {
  return (
    <div className="rounded-md border border-rule bg-surface p-8 shadow-[0_1px_0_rgba(28,26,26,0.04),0_8px_24px_-12px_rgba(28,26,26,0.12)]">
      <div className="mb-6 border-b border-rule pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
          Top Products
        </p>
        <h2 className="mt-2 font-serif text-2xl tracking-tight text-ink">
          Highest revenue{" "}
          <span className="italic text-muted">in the period</span>
        </h2>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="2 4"
              stroke="#d9d6cc"
              horizontal={false}
            />
            <XAxis
              type="number"
              stroke="#a8a39c"
              tickLine={false}
              axisLine={{ stroke: "#d9d6cc" }}
              tick={{ fill: "#6b6562", fontSize: 11 }}
              tickFormatter={formatCurrency}
            />
            <YAxis
              type="category"
              dataKey="product"
              stroke="#a8a39c"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#1c1a1a", fontSize: 12 }}
              width={170}
            />
            <Tooltip cursor={{ fill: "rgba(28,26,26,0.04)" }} content={<ChartTooltip />} />
            <Bar dataKey="revenue" name="Revenue" fill="#3f3a36" radius={[0, 2, 2, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
