"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RevenuePoint = {
  month: string;
  revenue: number;
};

type Props = {
  data: RevenuePoint[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number; payload: RevenuePoint }>;
  label?: string;
};

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const value = payload[0].value;
  return (
    <div className="rounded-md border border-rule bg-surface px-3 py-2 text-xs shadow-[0_8px_24px_-12px_rgba(28,26,26,0.2)]">
      <p className="font-medium uppercase tracking-[0.14em] text-muted text-[10px]">
        {label}
      </p>
      <p className="mt-1 font-serif text-base text-ink">
        SAR {value.toLocaleString()}
      </p>
    </div>
  );
}

export function RevenueChart({ data }: Props) {
  return (
    <div className="rounded-md border border-rule bg-surface p-8 shadow-[0_1px_0_rgba(28,26,26,0.04),0_8px_24px_-12px_rgba(28,26,26,0.12)]">
      <div className="mb-8 flex items-end justify-between border-b border-rule pb-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
            Revenue Overview
          </p>
          <h2 className="mt-2 font-serif text-2xl tracking-tight text-ink">
            Monthly revenue,{" "}
            <span className="italic text-muted">last 12 months</span>
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="h-px w-6 bg-ink" />
          <span className="uppercase tracking-[0.14em]">Revenue (SAR)</span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
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
              width={48}
            />
            <Tooltip
              cursor={{ stroke: "#a8a39c", strokeWidth: 1, strokeDasharray: "2 4" }}
              content={<ChartTooltip />}
            />
            <Line
              type="monotone"
              dataKey="revenue"
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
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
