import { Handshake, PackageCheck, Plus, RotateCcw, Search } from "lucide-react";
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
import { apiErrorMessage } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";

import { useAcertarConsignacao, useConsignacoes, useCreateConsignacao } from "./api";
import type { Consignacao } from "./types";

const EMPTY = { cliente: "", produto: "", enviada: "", valorUnit: "" };

function ConsignacaoCard({ c, onAcertar }: { c: Consignacao; onAcertar: (id: number, enviada: number) => void }) {
  const enviada = c.quantidade_enviada || 1;
  const vendidaPct = (c.quantidade_vendida / enviada) * 100;
  const devolvidaPct = (c.quantidade_devolvida / enviada) * 100;
  const emPoderPct = (c.quantidade_em_poder / enviada) * 100;
  const aAcertar = c.quantidade_vendida * Number(c.valor_unitario);

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{c.cliente}</p>
          <p className="truncate text-xs text-muted-foreground">{c.produto}</p>
        </div>
        <Badge variant={c.status === "aberta" ? "warning" : "success"}>
          {c.status === "aberta" ? "Aberta" : "Acertada"}
        </Badge>
      </div>

      {/* barra empilhada vendida/devolvida/em poder */}
      <div className="mt-4">
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-success" style={{ width: `${vendidaPct}%` }} title="Vendida" />
          <div className="h-full bg-muted-foreground/40" style={{ width: `${devolvidaPct}%` }} title="Devolvida" />
          <div className="h-full bg-amber-500" style={{ width: `${emPoderPct}%` }} title="Em poder" />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="tnum text-sm font-semibold text-success">{c.quantidade_vendida}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Vendida</p>
          </div>
          <div>
            <p className="tnum text-sm font-semibold text-amber-500">{c.quantidade_em_poder}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Em poder</p>
          </div>
          <div>
            <p className="tnum text-sm font-semibold text-muted-foreground">{c.quantidade_devolvida}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Devolvida</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">A acertar</p>
          <p className="tnum text-sm font-semibold">{formatCurrency(aAcertar)}</p>
        </div>
        {c.status === "aberta" && (
          <Button size="sm" variant="outline" onClick={() => onAcertar(c.id, c.quantidade_enviada)}>
            Acertar
          </Button>
        )}
      </div>
    </div>
  );
}

export function ConsignacaoPage() {
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY);

  const { data } = useConsignacoes({ size: 100 });
  const createMut = useCreateConsignacao();
  const acertarMut = useAcertarConsignacao();

  const items = data?.items ?? [];

  const filtered = items.filter(
    (c) =>
      c.cliente.toLowerCase().includes(search.toLowerCase()) ||
      c.produto.toLowerCase().includes(search.toLowerCase()),
  );
  const abertasList = filtered.filter((c) => c.status === "aberta");
  const acertadasList = filtered.filter((c) => c.status !== "aberta");

  const abertas = items.filter((c) => c.status === "aberta").length;
  const valorConsignado = items
    .filter((c) => c.status === "aberta")
    .reduce((a, c) => a + c.quantidade_em_poder * Number(c.valor_unitario), 0);
  const aAcertar = items
    .filter((c) => c.status === "aberta")
    .reduce((a, c) => a + c.quantidade_vendida * Number(c.valor_unitario), 0);
  const itensTerceiros = items
    .filter((c) => c.status === "aberta")
    .reduce((a, c) => a + c.quantidade_em_poder, 0);

  async function acertar(id: number, enviada: number) {
    const resp = window.prompt(
      `Quantas das ${enviada} unidades foram vendidas? (o restante volta como devolvido)`,
      String(enviada),
    );
    if (resp === null) return;
    const vendida = Number(resp);
    if (!Number.isFinite(vendida) || vendida < 0 || vendida > enviada) {
      toast.error(`Informe um valor entre 0 e ${enviada}`);
      return;
    }
    try {
      await acertarMut.mutateAsync({
        id,
        quantidade_vendida: vendida,
        quantidade_devolvida: enviada - vendida,
      });
      toast.success("Consignação acertada");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Nao foi possivel acertar"));
    }
  }

  async function save() {
    if (!form.cliente || !form.produto) {
      toast.error("Informe cliente e produto");
      return;
    }
    try {
      await createMut.mutateAsync({
        cliente: form.cliente,
        produto: form.produto,
        quantidade_enviada: Number(form.enviada) || 1,
        valor_unitario: form.valorUnit || "0",
        data: new Date().toISOString().slice(0, 10),
      });
      toast.success("Consignação registrada");
      setForm(EMPTY);
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Nao foi possivel salvar"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader path="/consignacao" actions={<Button onClick={() => setOpen(true)}><Plus /> Nova consignação</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Consignações abertas" value={abertas} icon={Handshake} />
        <StatCard label="Valor em consignação" value={formatCurrency(valorConsignado)} icon={PackageCheck} tone="warning" />
        <StatCard label="Vendido a acertar" value={formatCurrency(aAcertar)} icon={PackageCheck} tone="success" />
        <StatCard label="Itens em poder de terceiros" value={itensTerceiros} icon={RotateCcw} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por cliente ou produto..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 && (
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Nenhuma consignação encontrada.
        </p>
      )}

      {abertasList.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {abertasList.map((c) => (
            <ConsignacaoCard key={c.id} c={c} onAcertar={acertar} />
          ))}
        </div>
      )}

      {acertadasList.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Acertadas</h3>
          <div className={cn("grid grid-cols-1 gap-4 opacity-70 sm:grid-cols-2 lg:grid-cols-3")}>
            {acertadasList.map((c) => (
              <ConsignacaoCard key={c.id} c={c} onAcertar={acertar} />
            ))}
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova consignação</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Cliente *</Label>
              <Input value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Produto *</Label>
              <Input value={form.produto} onChange={(e) => setForm({ ...form, produto: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Quantidade enviada</Label>
              <Input type="number" value={form.enviada} onChange={(e) => setForm({ ...form, enviada: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Valor unitário (R$)</Label>
              <Input type="number" value={form.valorUnit} onChange={(e) => setForm({ ...form, valorUnit: e.target.value })} />
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
