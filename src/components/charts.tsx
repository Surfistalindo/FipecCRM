import { cn } from "@/lib/utils";

export interface Point {
  label: string;
  value: number;
}

/* ------------------------------------------------------------------ Bar */
export function BarChart({
  data,
  height = 200,
  className,
  valueFormatter = (v) => String(v),
}: {
  data: Point[];
  height?: number;
  className?: string;
  valueFormatter?: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={cn("flex items-stretch gap-3", className)} style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="group relative w-full rounded-t-md bg-primary/80 transition-all hover:bg-primary"
              style={{ height: `${(d.value / max) * 100}%` }}
              title={`${d.label}: ${valueFormatter(d.value)}`}
            >
              <span className="absolute -top-5 left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-foreground group-hover:block">
                {valueFormatter(d.value)}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- Area */
export function AreaChart({
  data,
  height = 200,
  className,
}: {
  data: Point[];
  height?: number;
  className?: string;
}) {
  const w = 600;
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;
  const step = data.length > 1 ? w / (data.length - 1) : w;
  const pts = data.map((d, i) => {
    const x = i * step;
    const y = height - ((d.value - min) / range) * (height - 20) - 10;
    return [x, y] as const;
  });
  const line = pts.map((p) => p.join(",")).join(" ");
  const area = `0,${height} ${line} ${w},${height}`;

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${w} ${height}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        style={{ height }}
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#areaFill)" />
        <polyline
          points={line}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Donut */
export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  size = 180,
  className,
}: {
  data: DonutSlice[];
  size?: number;
  className?: string;
}) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const radius = size / 2;
  const stroke = size * 0.18;
  const r = radius - stroke / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className={cn("flex items-center gap-6", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {data.map((d) => {
          const frac = d.value / total;
          const dash = frac * circ;
          const seg = (
            <circle
              key={d.label}
              cx={radius}
              cy={radius}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return seg;
        })}
      </svg>
      <div className="space-y-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-muted-foreground">{d.label}</span>
            <span className="ml-auto font-medium">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Sparkline */
export function Sparkline({
  data,
  className,
  color = "hsl(var(--primary))",
}: {
  data: number[];
  className?: string;
  color?: string;
}) {
  const w = 100;
  const h = 28;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = data.length > 1 ? w / (data.length - 1) : w;
  const line = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-7 w-full", className)}>
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
