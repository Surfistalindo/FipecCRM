import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn, formatCurrency } from "@/lib/utils";

/* ------------------------------------------------------------- Tooltip UI */

function ChartTooltipShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg">
      {children}
    </div>
  );
}

/* --------------------------------------------------------- Fluxo de caixa */

export interface FluxoPonto {
  data: string; // yyyy-mm-dd
  entradas: number;
  saidas: number;
}

function formatDiaCurto(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function FluxoCaixaChart({ data }: { data: FluxoPonto[] }) {
  const [showEntradas, setShowEntradas] = React.useState(true);
  const [showSaidas, setShowSaidas] = React.useState(true);

  const totalEntradas = data.reduce((a, d) => a + d.entradas, 0);
  const totalSaidas = data.reduce((a, d) => a + d.saidas, 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <LegendToggle
          active={showEntradas}
          onClick={() => setShowEntradas((v) => !v)}
          color="hsl(var(--success))"
          label="Entradas"
          value={formatCurrency(totalEntradas)}
        />
        <LegendToggle
          active={showSaidas}
          onClick={() => setShowSaidas((v) => !v)}
          color="hsl(var(--destructive))"
          label="Saídas"
          value={formatCurrency(totalSaidas)}
        />
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fillEntradas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.32} />
              <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillSaidas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.28} />
              <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="hsl(var(--chart-grid))"
            strokeDasharray="3 4"
          />
          <XAxis
            dataKey="data"
            tickFormatter={formatDiaCurto}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--chart-grid))" }}
            interval={Math.ceil(data.length / 7)}
            minTickGap={24}
          />
          <YAxis
            width={0}
            tick={false}
            axisLine={false}
            tickLine={false}
            domain={[0, (max: number) => max * 1.15]}
          />
          <Tooltip
            cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "3 3" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const entradas = payload.find((p) => p.dataKey === "entradas")?.value as number | undefined;
              const saidas = payload.find((p) => p.dataKey === "saidas")?.value as number | undefined;
              return (
                <ChartTooltipShell>
                  <p className="mb-1.5 font-semibold text-popover-foreground">
                    {formatDiaCurto(String(label))}
                  </p>
                  {showEntradas && entradas !== undefined && (
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-success" /> Entradas
                      <span className="ml-auto font-medium tnum text-popover-foreground">
                        {formatCurrency(entradas)}
                      </span>
                    </p>
                  )}
                  {showSaidas && saidas !== undefined && (
                    <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-destructive" /> Saídas
                      <span className="ml-auto font-medium tnum text-popover-foreground">
                        {formatCurrency(saidas)}
                      </span>
                    </p>
                  )}
                </ChartTooltipShell>
              );
            }}
          />
          {showEntradas && (
            <Area
              type="monotone"
              dataKey="entradas"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              fill="url(#fillEntradas)"
              activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--card))" }}
              animationDuration={600}
            />
          )}
          {showSaidas && (
            <Area
              type="monotone"
              dataKey="saidas"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              fill="url(#fillSaidas)"
              activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--card))" }}
              animationDuration={600}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function LegendToggle({
  active,
  onClick,
  color,
  label,
  value,
}: {
  active: boolean;
  onClick: () => void;
  color: string;
  label: string;
  value: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition-all",
        active ? "border-border bg-muted/40" : "border-transparent opacity-40",
      )}
    >
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold tnum">{value}</span>
    </button>
  );
}

/* --------------------------------------------------------------- Ranking */

export interface RankingItem {
  label: string;
  value: number;
  sublabel?: string;
}

export function RankingBarChart({
  data,
  valueFormatter = (v) => String(v),
}: {
  data: RankingItem[];
  valueFormatter?: (v: number) => string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
        Sem dados suficientes neste período.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 44)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 28, left: 0, bottom: 0 }}
        barCategoryGap={14}
      >
        <XAxis type="number" hide domain={[0, (max: number) => max * 1.12]} />
        <YAxis
          type="category"
          dataKey="label"
          width={140}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "hsl(var(--foreground))", fontSize: 12.5, fontWeight: 500 }}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--accent))" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const item = payload[0].payload as RankingItem;
            return (
              <ChartTooltipShell>
                <p className="font-semibold text-popover-foreground">{item.label}</p>
                <p className="mt-0.5 tnum text-muted-foreground">
                  {valueFormatter(item.value)}
                  {item.sublabel ? ` · ${item.sublabel}` : ""}
                </p>
              </ChartTooltipShell>
            );
          }}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22} animationDuration={500}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={i === 0 ? "hsl(var(--chart-1))" : "hsl(var(--chart-1) / 0.55)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------- Donut categorico */

export interface DonutSlice {
  label: string;
  value: number;
}

const DONUT_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--muted-foreground))",
];

export function PaymentDonutChart({ data }: { data: DonutSlice[] }) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const total = data.reduce((a, d) => a + d.value, 0) || 1;

  if (data.length === 0) {
    return (
      <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
        Sem vendas registradas neste período.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="relative shrink-0">
        <ResponsiveContainer width={168} height={168}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={54}
              outerRadius={80}
              paddingAngle={2}
              cornerRadius={4}
              stroke="hsl(var(--card))"
              strokeWidth={2}
              animationDuration={500}
              onMouseEnter={(_, i) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                  opacity={activeIndex === null || activeIndex === i ? 1 : 0.35}
                  style={{ transition: "opacity 150ms ease" }}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const slice = payload[0].payload as DonutSlice;
                return (
                  <ChartTooltipShell>
                    <p className="font-semibold text-popover-foreground">{slice.label}</p>
                    <p className="mt-0.5 tnum text-muted-foreground">
                      {formatCurrency(slice.value)} · {Math.round((slice.value / total) * 100)}%
                    </p>
                  </ChartTooltipShell>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[0.65rem] text-muted-foreground">Total</span>
          <span className="text-sm font-bold tnum">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="w-full flex-1 space-y-1.5">
        {data.map((d, i) => (
          <button
            key={d.label}
            type="button"
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
              activeIndex === i ? "bg-muted/60" : "hover:bg-muted/40",
            )}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
            />
            <span className="truncate text-muted-foreground">{d.label}</span>
            <span className="ml-auto shrink-0 font-semibold tnum">
              {Math.round((d.value / total) * 100)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
