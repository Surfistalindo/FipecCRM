import { BadgeDollarSign, Medal, Percent, Plus, Search, Target, Trash2, Trophy } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader, StatCard } from "@/components/page-header";
import { Avatar } from "@/components/ui/avatar";
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
import { apiErrorMessage } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";

import { useCreateVendedor, useDeleteVendedor, useVendedores } from "./api";
import type { Vendedor } from "./types";

const EMPTY = { nome: "", meta_mensal: "", comissao_pct: "" };

const PODIO_ESTILO = [
  { medalha: "text-amber-400", altura: "h-28", ordem: "sm:order-2" },
  { medalha: "text-slate-300", altura: "h-20", ordem: "sm:order-1" },
  { medalha: "text-amber-700", altura: "h-16", ordem: "sm:order-3" },
];

export function VendedoresPage() {
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError } = useVendedores({ size: 100, search: debounced || undefined });
  const createMut = useCreateVendedor();
  const deleteMut = useDeleteVendedor();

  const items = data?.items ?? [];
  const ativos = items.filter((v) => v.ativo).length;
  const totalVendas = items.reduce((a, v) => a + Number(v.vendas_mes), 0);
  const totalComissao = items.reduce((a, v) => a + (Number(v.vendas_mes) * Number(v.comissao_pct)) / 100, 0);
  const metaMedia = items.length
    ? Math.round((items.reduce((a, v) => a + Number(v.vendas_mes) / (Number(v.meta_mensal) || 1), 0) / items.length) * 100)
    : 0;

  const ranking = [...items].sort((a, b) => Number(b.vendas_mes) - Number(a.vendas_mes));
  const podio = ranking.slice(0, 3);
  const resto = ranking.slice(3);

  async function save() {
    if (!form.nome) return toast.error("Informe o nome do vendedor");
    try {
      await createMut.mutateAsync({
        nome: form.nome,
        meta_mensal: form.meta_mensal || "50000",
        comissao_pct: form.comissao_pct || "2.5",
      });
      toast.success("Vendedor cadastrado");
      setForm(EMPTY);
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível salvar"));
    }
  }

  async function handleDelete(v: Vendedor) {
    if (!confirm(`Excluir o vendedor "${v.nome}"?`)) return;
    try {
      await deleteMut.mutateAsync(v.id);
      toast.success("Vendedor excluído");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível excluir"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        path="/vendedores"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus /> Novo vendedor
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Vendedores ativos" value={ativos} icon={BadgeDollarSign} />
        <StatCard label="Vendas no mês" value={formatCurrency(totalVendas)} icon={Target} tone="success" />
        <StatCard label="Comissões a pagar" value={formatCurrency(totalComissao)} icon={Percent} tone="warning" />
        <StatCard label="Meta média atingida" value={`${metaMedia}%`} icon={Trophy} tone={metaMedia >= 100 ? "success" : "default"} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar vendedor..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading && <p className="py-16 text-center text-sm text-muted-foreground">Carregando...</p>}
      {isError && <p className="py-16 text-center text-sm text-destructive">Erro ao carregar vendedores.</p>}
      {!isLoading && items.length === 0 && (
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Nenhum vendedor cadastrado.
        </p>
      )}

      {/* ---- Podio ---- */}
      {podio.length > 0 && (
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:justify-center">
          {podio.map((v, idx) => {
            const meta = Number(v.meta_mensal) || 1;
            const pct = Math.round((Number(v.vendas_mes) / meta) * 100);
            const estilo = PODIO_ESTILO[idx];
            return (
              <div key={v.id} className={cn("flex w-full flex-col items-center gap-2 sm:w-56", estilo.ordem)}>
                <Medal className={cn("h-6 w-6", estilo.medalha)} />
                <Avatar name={v.nome} className="h-14 w-14 text-lg" />
                <p className="text-center text-sm font-semibold">{v.nome}</p>
                <p className="tnum text-lg font-bold">{formatCurrency(v.vendas_mes)}</p>
                <Badge variant={pct >= 100 ? "success" : "secondary"}>{pct}% da meta</Badge>
                <div
                  className={cn(
                    "flex w-full items-end justify-center rounded-t-lg border-x border-t bg-gradient-to-t from-muted/50 to-transparent",
                    estilo.altura,
                  )}
                >
                  <span className="pb-2 text-2xl font-bold text-muted-foreground/40">#{idx + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---- Resto do ranking ---- */}
      {resto.length > 0 && (
        <div className="space-y-2">
          {resto.map((v, idx) => {
            const meta = Number(v.meta_mensal) || 1;
            const vendas = Number(v.vendas_mes);
            const pct = Math.round((vendas / meta) * 100);
            const comissao = (vendas * Number(v.comissao_pct)) / 100;
            return (
              <div key={v.id} className="group flex items-center gap-4 rounded-xl border bg-card p-3 shadow-sm">
                <span className="w-6 text-center text-sm font-medium text-muted-foreground">{idx + 4}</span>
                <Avatar name={v.nome} className="h-9 w-9" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{v.nome}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", pct >= 100 ? "bg-success" : pct >= 60 ? "bg-primary" : "bg-amber-500")}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{pct}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="tnum text-sm font-semibold">{formatCurrency(vendas)}</p>
                  <p className="tnum text-xs text-muted-foreground">comissão {formatCurrency(comissao)}</p>
                </div>
                <Badge variant={v.ativo ? "success" : "secondary"}>{v.ativo ? "Ativo" : "Inativo"}</Badge>
                <button onClick={() => handleDelete(v)} className="hidden text-muted-foreground hover:text-destructive group-hover:block">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo vendedor</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Meta mensal (R$)</Label>
              <Input type="number" value={form.meta_mensal} onChange={(e) => setForm({ ...form, meta_mensal: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Comissão (%)</Label>
              <Input type="number" step="0.5" value={form.comissao_pct} onChange={(e) => setForm({ ...form, comissao_pct: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={createMut.isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
