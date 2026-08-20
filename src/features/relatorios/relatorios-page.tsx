import {
  CalendarClock,
  MapPin,
  Package,
  TrendingUp,
  UserX,
  Users,
} from "lucide-react";

import { BarChart } from "@/components/charts";
import { PageHeader, StatCard } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";

import { useRelatoriosResumo } from "./api";

export function RelatoriosPage() {
  const { data: resumo, isLoading } = useRelatoriosResumo();

  if (isLoading || !resumo) {
    return (
      <div className="space-y-6">
        <PageHeader path="/relatorios" />
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const {
    vendas_por_periodo,
    vendas_por_cidade,
    produtos_mais_vendidos,
    vendedores_ranking,
    clientes_ranking,
    clientes_inativos,
    fechamento_dia,
  } = resumo;

  const totalPeriodo = vendas_por_periodo.reduce((a, d) => a + Number(d.total), 0);
  const melhorMes = [...vendas_por_periodo].sort((a, b) => Number(b.total) - Number(a.total))[0];
  const maxCidade = Math.max(...vendas_por_cidade.map((c) => Number(c.total)), 1);
  const maxProduto = Math.max(...produtos_mais_vendidos.map((p) => Number(p.total)), 1);

  return (
    <div className="space-y-6">
      <PageHeader path="/relatorios" />

      <Tabs defaultValue="periodo">
        <div className="overflow-x-auto pb-1">
          <TabsList>
            <TabsTrigger value="periodo"><TrendingUp className="h-4 w-4" /> Por período</TabsTrigger>
            <TabsTrigger value="cidade"><MapPin className="h-4 w-4" /> Por cidade</TabsTrigger>
            <TabsTrigger value="produtos"><Package className="h-4 w-4" /> Mais vendidos</TabsTrigger>
            <TabsTrigger value="vendedores"><Users className="h-4 w-4" /> Vendedores</TabsTrigger>
            <TabsTrigger value="clientes"><Users className="h-4 w-4" /> Clientes</TabsTrigger>
            <TabsTrigger value="inativos"><UserX className="h-4 w-4" /> Inativos</TabsTrigger>
            <TabsTrigger value="fechamento"><CalendarClock className="h-4 w-4" /> Fechamento</TabsTrigger>
          </TabsList>
        </div>

        {/* ---- Vendas por período ---- */}
        <TabsContent value="periodo">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por período (últimos 6 meses)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <BarChart
                data={vendas_por_periodo.map((d) => ({ label: d.label, value: Number(d.total) }))}
                valueFormatter={(v) => formatCurrency(v)}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Faturamento total" value={formatCurrency(totalPeriodo)} icon={TrendingUp} tone="success" />
                <StatCard label="Média mensal" value={formatCurrency(totalPeriodo / (vendas_por_periodo.length || 1))} icon={TrendingUp} />
                <StatCard label="Melhor mês" value={melhorMes?.label ?? "—"} hint={formatCurrency(melhorMes?.total ?? 0)} icon={CalendarClock} tone="warning" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Vendas por cidade ---- */}
        <TabsContent value="cidade">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por cidade (últimos 6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cidade</TableHead>
                    <TableHead className="text-center">Pedidos</TableHead>
                    <TableHead className="text-right">Faturamento</TableHead>
                    <TableHead className="w-1/3">Participação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendas_por_cidade.map((c) => (
                    <TableRow key={`${c.cidade}-${c.uf}`}>
                      <TableCell className="font-medium">
                        {c.cidade}
                        {c.uf && <span className="text-muted-foreground">/{c.uf}</span>}
                      </TableCell>
                      <TableCell className="text-center text-sm">{c.pedidos}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{formatCurrency(c.total)}</TableCell>
                      <TableCell>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${(Number(c.total) / maxCidade) * 100}%` }} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {vendas_por_cidade.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                        Nenhuma venda com cliente/cidade identificados no período
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Produtos mais vendidos ---- */}
        <TabsContent value="produtos">
          <Card>
            <CardHeader>
              <CardTitle>Produtos mais vendidos (últimos 6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Qtd</TableHead>
                    <TableHead className="text-right">Faturamento</TableHead>
                    <TableHead className="w-1/4">Representatividade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtos_mais_vendidos.map((p, i) => (
                    <TableRow key={p.produto_id}>
                      <TableCell className="text-sm text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{p.produto}</TableCell>
                      <TableCell className="text-center text-sm">{Number(p.quantidade)}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{formatCurrency(p.total)}</TableCell>
                      <TableCell>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-success" style={{ width: `${(Number(p.total) / maxProduto) * 100}%` }} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {produtos_mais_vendidos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        Nenhuma venda finalizada no período
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Melhores vendedores ---- */}
        <TabsContent value="vendedores">
          <Card>
            <CardHeader>
              <CardTitle>Melhores vendedores (últimos 6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-center">Pedidos</TableHead>
                    <TableHead className="text-right">Ticket médio</TableHead>
                    <TableHead className="text-right">Total vendido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendedores_ranking.map((v, i) => (
                    <TableRow key={v.vendedor_id}>
                      <TableCell>{i === 0 ? "🏆" : <span className="text-sm text-muted-foreground">{i + 1}</span>}</TableCell>
                      <TableCell className="font-medium">{v.nome}</TableCell>
                      <TableCell className="text-center text-sm">{v.pedidos}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatCurrency(Number(v.total) / (v.pedidos || 1))}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">{formatCurrency(v.total)}</TableCell>
                    </TableRow>
                  ))}
                  {vendedores_ranking.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        Nenhuma venda com vendedor identificado no período
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Melhores clientes ---- */}
        <TabsContent value="clientes">
          <Card>
            <CardHeader>
              <CardTitle>Melhores clientes (últimos 6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-center">Compras</TableHead>
                    <TableHead className="text-right">Total gasto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes_ranking.map((c, i) => (
                    <TableRow key={c.cliente_id}>
                      <TableCell>{i === 0 ? "⭐" : <span className="text-sm text-muted-foreground">{i + 1}</span>}</TableCell>
                      <TableCell className="font-medium">{c.nome}</TableCell>
                      <TableCell className="text-center text-sm">{c.compras}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{formatCurrency(c.total)}</TableCell>
                    </TableRow>
                  ))}
                  {clientes_ranking.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                        Nenhuma compra identificada no período
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Clientes inativos ---- */}
        <TabsContent value="inativos">
          <Card>
            <CardHeader>
              <CardTitle>Clientes inativos (sem compra há +90 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Última compra</TableHead>
                    <TableHead className="text-center">Dias inativo</TableHead>
                    <TableHead className="text-right">Histórico total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes_inativos.map((c) => (
                    <TableRow key={c.cliente_id}>
                      <TableCell className="font-medium">{c.nome}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.ultima_compra ? new Date(c.ultima_compra).toLocaleDateString("pt-BR") : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="destructive">{c.dias_inativo} dias</Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(c.total_historico)}</TableCell>
                    </TableRow>
                  ))}
                  {clientes_inativos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                        Nenhum cliente inativo — todos compraram nos últimos 90 dias
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Fechamento do dia ---- */}
        <TabsContent value="fechamento">
          <Card>
            <CardHeader>
              <CardTitle>Fechamento do dia — {new Date(`${fechamento_dia.data}T00:00:00`).toLocaleDateString("pt-BR")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Vendas do dia" value={formatCurrency(fechamento_dia.total_vendas)} icon={TrendingUp} tone="success" />
                <StatCard label="Nº de vendas" value={fechamento_dia.numero_vendas} icon={Package} />
                <StatCard label="Ticket médio" value={formatCurrency(fechamento_dia.ticket_medio)} icon={Users} />
                <StatCard label="Cancelamentos" value={formatCurrency(fechamento_dia.total_cancelamentos)} icon={UserX} tone="destructive" />
              </div>
              <Card className="bg-muted/30">
                <CardContent className="space-y-2 p-5">
                  <h3 className="text-sm font-semibold">Formas de pagamento</h3>
                  {fechamento_dia.formas_pagamento.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma venda finalizada hoje ainda</p>
                  )}
                  {fechamento_dia.formas_pagamento.map((p) => (
                    <div key={p.forma} className="flex items-center justify-between border-b py-2 text-sm last:border-0">
                      <span className="text-muted-foreground">{p.forma}</span>
                      <span className="font-medium">{formatCurrency(p.total)}</span>
                    </div>
                  ))}
                  {fechamento_dia.formas_pagamento.length > 0 && (
                    <div className="flex items-center justify-between pt-2 text-sm font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(fechamento_dia.total_vendas)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
