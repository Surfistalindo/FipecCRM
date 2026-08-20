import {
  AlertTriangle,
  Award,
  CalendarClock,
  CircleDollarSign,
  ShoppingCart,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";

import { StatCard } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { cn, formatCurrency } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

import { useDashboardResumo } from "./api";
import { FluxoCaixaChart, PaymentDonutChart, RankingBarChart } from "./charts";

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useDashboardResumo();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Olá, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Aqui está o resumo real do seu negócio hoje, {formatDate(new Date().toISOString())}.
        </p>
      </div>

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Não foi possível carregar os dados do dashboard agora.
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[104px] rounded-xl" />)
        ) : (
          <>
            <StatCard
              label="Receita do mês"
              value={formatCurrency(data?.kpis.receita_mes ?? 0)}
              icon={CircleDollarSign}
              trend={
                data?.kpis.variacao_receita_pct != null
                  ? { value: `${data.kpis.variacao_receita_pct}%`, up: data.kpis.variacao_receita_pct >= 0 }
                  : undefined
              }
              hint="vs. mês anterior"
            />
            <StatCard
              label="Vendas no mês"
              value={data?.kpis.vendas_mes ?? 0}
              icon={ShoppingCart}
              trend={
                data?.kpis.variacao_vendas_pct != null
                  ? { value: `${data.kpis.variacao_vendas_pct}%`, up: data.kpis.variacao_vendas_pct >= 0 }
                  : undefined
              }
              hint="vs. mês anterior"
            />
            <StatCard
              label="Ticket médio"
              value={formatCurrency(data?.kpis.ticket_medio ?? 0)}
              icon={Ticket}
              hint="por venda finalizada"
            />
            <StatCard
              label="Clientes ativos"
              value={data?.kpis.clientes_ativos ?? 0}
              icon={Users}
              hint={`+${data?.kpis.novos_clientes_mes ?? 0} novos este mês`}
            />
            <StatCard
              label="Estoque baixo"
              value={data?.kpis.produtos_estoque_baixo ?? 0}
              icon={AlertTriangle}
              tone={((data?.kpis.produtos_estoque_baixo ?? 0) > 0 ? "warning" : "success") as "warning" | "success"}
              hint="produtos no ou abaixo do mínimo"
            />
          </>
        )}
      </div>

      {/* Fluxo de caixa + Contas a vencer */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fluxo de caixa · últimos 30 dias</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[260px]" />
            ) : (
              <FluxoCaixaChart
                data={(data?.fluxo_caixa ?? []).map((p) => ({
                  data: p.data,
                  entradas: Number(p.entradas),
                  saidas: Number(p.saidas),
                }))}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" /> Contas a vencer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-11" />)
            ) : (data?.contas_a_vencer.length ?? 0) === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nada vencendo nos próximos 7 dias.
              </p>
            ) : (
              data?.contas_a_vencer.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.descricao}</p>
                    <p className="text-xs text-muted-foreground">
                      Vence em {formatDate(c.vencimento)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={cn(
                        "tnum text-sm font-semibold",
                        c.tipo === "receber" ? "text-success" : "text-destructive",
                      )}
                    >
                      {formatCurrency(c.valor)}
                    </p>
                    <Badge variant={c.tipo === "receber" ? "success" : "destructive"} className="mt-0.5">
                      {c.tipo === "receber" ? "A receber" : "A pagar"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rankings + composicao */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" /> Produtos mais vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-52" />
            ) : (
              <RankingBarChart
                data={(data?.produtos_mais_vendidos ?? []).map((p) => ({
                  label: p.produto,
                  value: Number(p.valor),
                  sublabel: `${Number(p.quantidade)} un.`,
                }))}
                valueFormatter={(v) => formatCurrency(v)}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Ranking de vendedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-52" />
            ) : (
              <RankingBarChart
                data={(data?.vendedores_ranking ?? []).map((v) => ({
                  label: v.vendedor,
                  value: Number(v.total),
                  sublabel:
                    Number(v.meta) > 0
                      ? `${Math.round((Number(v.total) / Number(v.meta)) * 100)}% da meta`
                      : undefined,
                }))}
                valueFormatter={(v) => formatCurrency(v)}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" /> Formas de pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-52" />
            ) : (
              <PaymentDonutChart
                data={(data?.vendas_por_forma_pagamento ?? []).map((f) => ({
                  label: f.forma,
                  value: Number(f.total),
                }))}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
