"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "@/lib/utils";

export interface RankedDatum {
  label: string;
  value: number;
}

const AXIS_TICK = { fill: "var(--chart-ink-muted)", fontSize: 12 };

/**
 * Horizontal bars for "compare magnitude across nominal categories".
 *
 * One series → ONE color for every bar. Deliberately NOT a darker-where-bigger
 * ramp: the categories (tours, divisions, roles) have no natural order, and a
 * ramp would double-encode bar length as hue.
 */
export function RankedBarChart({
  data,
  valueLabel,
  formatValue = formatNumber,
  highlightFirst = false,
}: {
  data: RankedDatum[];
  valueLabel: string;
  formatValue?: (n: number) => string;
  /** Emphasis: lead bar in the series hue, the rest recede to neutral. */
  highlightFirst?: boolean;
}) {
  // 34px per row keeps ≤24px bars with air around them; +28 for the x-axis band
  // so the axis labels are inside the container and the card never gains a
  // nested scrollbar.
  const height = data.length * 34 + 28;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 44, bottom: 0, left: 0 }}
        barCategoryGap="22%"
      >
        <CartesianGrid
          horizontal={false}
          stroke="var(--chart-grid)"
          strokeWidth={1}
        />
        <XAxis
          type="number"
          tick={AXIS_TICK}
          tickFormatter={formatValue}
          axisLine={{ stroke: "var(--chart-axis)" }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={150}
          tick={AXIS_TICK}
          axisLine={false}
          tickLine={false}
          // Recharts does not wrap or ellipsise category ticks — a long tour
          // title would simply be painted over the plot area. Truncate here;
          // the full name stays in the tooltip and the table view.
          tickFormatter={(label: string) =>
            label.length > 20 ? `${label.slice(0, 19)}…` : label
          }
        />
        <Tooltip
          cursor={{ fill: "var(--chart-grid)", fillOpacity: 0.45 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const datum = payload[0].payload as RankedDatum;
            return (
              <div className="rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-lg">
                <p className="font-medium">{datum.label}</p>
                <p className="text-muted-foreground">
                  {valueLabel}:{" "}
                  <span className="font-semibold text-foreground tabular-nums">
                    {formatValue(datum.value)}
                  </span>
                </p>
              </div>
            );
          }}
        />
        <Bar
          dataKey="value"
          maxBarSize={24}
          // Rounded at the data end, square at the baseline.
          radius={[0, 4, 4, 0]}
          isAnimationActive={false}
          label={{
            position: "right",
            formatter: (v: unknown) => formatValue(Number(v ?? 0)),
            fill: "var(--chart-ink-muted)",
            fontSize: 12,
          }}
        >
          {data.map((datum, i) => (
            <Cell
              key={datum.label}
              fill={
                highlightFirst && i > 0
                  ? "var(--chart-neutral)"
                  : "var(--chart-series)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
