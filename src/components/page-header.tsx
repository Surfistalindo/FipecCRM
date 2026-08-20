import { ArrowDownRight, ArrowUpRight, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";

import { findModuleByPath } from "@/config/modules";
import { cn } from "@/lib/utils";

/** Cabecalho padrao de cada modulo: breadcrumb + titulo + acoes. */
export function PageHeader({
  path,
  title,
  description,
  icon,
  actions,
}: {
  /** rota atual, usada para montar o breadcrumb a partir do registro */
  path: string;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}) {
  const mod = findModuleByPath(path);
  const Icon = icon ?? mod?.icon;
  const heading = title ?? mod?.label ?? "";
  const desc = description ?? mod?.description;

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Link to="/" className="transition-colors hover:text-foreground">
          Início
        </Link>
        {mod && (
          <>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            <span>{mod.group}</span>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5 opacity-60" />
        <span className="text-foreground">{heading}</span>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-primary">
              <Icon className="h-6 w-6" />
            </div>
          )}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">
              {heading}
            </h1>
            {desc && (
              <p className="max-w-2xl text-sm text-muted-foreground">{desc}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 sm:shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}

/** Card de estatistica/KPI reutilizavel — visual premium. */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  hint?: React.ReactNode;
  trend?: { value: string; up?: boolean };
  tone?: "default" | "success" | "destructive" | "warning";
}) {
  const toneMap = {
    default: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    destructive: "text-destructive bg-destructive/10",
    warning: "text-warning bg-warning/10",
  } as const;

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110",
              toneMap[tone],
            )}
          >
            <Icon className="h-[1.1rem] w-[1.1rem]" />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="tnum text-[1.7rem] font-bold leading-none tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "mb-0.5 inline-flex items-center gap-0.5 text-xs font-semibold",
              trend.up ? "text-success" : "text-destructive",
            )}
          >
            {trend.up ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {trend.value}
          </span>
        )}
      </div>
      {hint && <div className="mt-1.5 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
