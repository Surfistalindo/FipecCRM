import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  PackageCheck,
  Plus,
  TriangleAlert,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader, StatCard } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useProdutos } from "@/features/produtos/api";
import { apiErrorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

import { useCreateMovimento, useMovimentos } from "./api";
import type { TipoMovimento } from "./types";

const TIPO_META: Record<
  TipoMovimento,
  { label: string; icon: typeof ArrowUpRight; ring: string; dot: string }
> = {
  entrada: { label: "Entrada", icon: ArrowDownLeft, ring: "bg-success/10 text-success", dot: "bg-success" },
  saida: { label: "Saída", icon: ArrowUpRight, ring: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
  transferencia: { label: "Transferência", icon: ArrowLeftRight, ring: "bg-primary/10 text-primary", dot: "bg-primary" },
  ajuste: { label: "Ajuste", icon: PackageCheck, ring: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
};

const EMPTY = { produto_id: "", tipo: "entrada" as TipoMovimento, quantidade: "", origem: "" };

export function EstoquePage() {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY);

  const { data, isLoading, isError } = useMovimentos({ size: 50 });
  const { data: produtosData } = useProdutos({ size: 200 });
  const createMut = useCreateMovimento();

  const movs = data?.items ?? [];
  const produtos = produtosData?.items ?? [];

  const entradas = movs.filter((m) => m.tipo === "entrada").reduce((a, m) => a + Number(m.quantidade), 0);
  const saidas = movs.filter((m) => m.tipo === "saida").reduce((a, m) => a + Number(m.quantidade), 0);
  const criticos = produtos
    .filter((p) => Number(p.estoque) <= Number(p.estoque_minimo))
    .sort((a, b) => Number(a.estoque) - Number(b.estoque));

  async function save() {
    if (!form.produto_id) return toast.error("Selecione o produto");
    if (!form.quantidade) return toast.error("Informe a quantidade");
    if (form.tipo === "ajuste" && Number(form.quantidade) === 0) {
      return toast.error("Quantidade do ajuste não pode ser zero");
    }
    try {
      await createMut.mutateAsync({
        produto_id: Number(form.produto_id),
        tipo: form.tipo,
        quantidade: form.quantidade,
        origem: form.origem || undefined,
      });
      toast.success("Movimentação registrada");
      setForm(EMPTY);
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível registrar"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader path="/estoque" actions={<Button onClick={() => setOpen(true)}><Plus /> Nova movimentação</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Entradas (un)" value={entradas} icon={ArrowDownLeft} tone="success" />
        <StatCard label="Saídas (un)" value={saidas} icon={ArrowUpRight} tone="destructive" />
        <StatCard label="Movimentações" value={data?.total ?? 0} icon={ArrowLeftRight} />
        <StatCard label="Itens em falta" value={criticos.length} icon={TriangleAlert} tone="warning" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* ---- Feed de movimentações (linha do tempo) ---- */}
        <div className="rounded-xl border bg-card">
          <div className="border-b px-5 py-3">
            <h3 className="text-sm font-semibold">Movimentações recentes</h3>
          </div>
          <div className="max-h-[600px] overflow-y-auto p-2">
            {isLoading && <p className="p-6 text-center text-sm text-muted-foreground">Carregando...</p>}
            {isError && <p className="p-6 text-center text-sm text-destructive">Erro ao carregar movimentações.</p>}
            {!isLoading && movs.length === 0 && (
              <p className="p-10 text-center text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>
            )}
            <div className="relative">
              {movs.map((m, i) => {
                const meta = TIPO_META[m.tipo];
                const Icon = meta.icon;
                const qtd = Number(m.quantidade);
                return (
                  <div key={m.id} className="relative flex gap-3 px-3 py-2.5">
                    {i < movs.length - 1 && (
                      <span className="absolute left-[27px] top-11 h-[calc(100%-1rem)] w-px bg-border" />
                    )}
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", meta.ring)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-medium">{m.produto.nome}</p>
                        <span className={cn("shrink-0 text-sm font-semibold tnum", qtd >= 0 ? "text-success" : "text-destructive")}>
                          {qtd > 0 ? "+" : ""}
                          {qtd}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">{meta.label}</Badge>
                        <span>{formatDateTime(m.data)}</span>
                        {m.origem && <span className="truncate">· {m.origem}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ---- Painel de produtos críticos ---- */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center gap-2 border-b px-5 py-3">
            <TriangleAlert className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Estoque crítico</h3>
            <Badge variant="warning" className="ml-auto">{criticos.length}</Badge>
          </div>
          <div className="max-h-[600px] space-y-1 overflow-y-auto p-2">
            {criticos.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                <PackageCheck className="h-8 w-8 opacity-30" />
                <p className="text-sm">Nenhum item abaixo do mínimo</p>
              </div>
            )}
            {criticos.map((p) => {
              const estoque = Number(p.estoque);
              const minimo = Number(p.estoque_minimo);
              const pct = minimo > 0 ? Math.min((estoque / minimo) * 100, 100) : 0;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setForm({ ...EMPTY, produto_id: String(p.id), tipo: "entrada" });
                    setOpen(true);
                  }}
                  className="flex w-full flex-col gap-1.5 rounded-lg p-2.5 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium">{p.nome}</span>
                    <span className={cn("shrink-0 text-xs font-semibold tnum", estoque === 0 ? "text-destructive" : "text-amber-500")}>
                      {estoque}/{minimo}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", estoque === 0 ? "bg-destructive" : "bg-amber-500")}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova movimentação</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Produto *</Label>
              <Select value={form.produto_id} onChange={(e) => setForm({ ...form, produto_id: e.target.value })}>
                <option value="">Selecione um produto</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome} {p.codigo ? `(${p.codigo})` : ""}</option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoMovimento })}>
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                  <option value="transferencia">Transferência</option>
                  <option value="ajuste">Ajuste (aceita negativo)</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Quantidade</Label>
                <Input type="number" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5"><Label>Origem / observação</Label><Input value={form.origem} onChange={(e) => setForm({ ...form, origem: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={createMut.isPending}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
