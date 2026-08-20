import { ArrowDownCircle, ArrowUpCircle, Check, Plus, Wallet } from "lucide-react";
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
import { apiErrorMessage } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";

import { useBaixarConta, useContas, useCreateConta } from "./api";
import type { ContaFinanceira, TipoConta } from "./types";

const EMPTY = { descricao: "", contraparte: "", vencimento: "", valor: "" };

function diasAte(vencimento: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const v = new Date(`${vencimento}T00:00:00`);
  return Math.round((v.getTime() - hoje.getTime()) / 86400000);
}

type GrupoKey = "vencidas" | "hoje" | "semana" | "futuras";

const GRUPO_META: Record<GrupoKey, { label: string; dot: string }> = {
  vencidas: { label: "Vencidas", dot: "bg-destructive" },
  hoje: { label: "Vencem hoje", dot: "bg-amber-500" },
  semana: { label: "Próximos 7 dias", dot: "bg-primary" },
  futuras: { label: "Depois", dot: "bg-muted-foreground" },
};

function grupoDe(dias: number): GrupoKey {
  if (dias < 0) return "vencidas";
  if (dias === 0) return "hoje";
  if (dias <= 7) return "semana";
  return "futuras";
}

function LinhaConta({ c, onBaixar }: { c: ContaFinanceira; onBaixar: (c: ContaFinanceira) => void }) {
  const dias = diasAte(c.vencimento);
  const vencida = dias < 0 && !c.pago;
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{c.descricao}</p>
        <p className="truncate text-xs text-muted-foreground">
          {c.contraparte ?? "—"} ·{" "}
          {c.pago
            ? "Pago"
            : dias < 0
              ? `${Math.abs(dias)}d atrás`
              : dias === 0
                ? "vence hoje"
                : `em ${dias}d`}
        </p>
      </div>
      <span className={cn("shrink-0 text-sm font-semibold tnum", vencida && "text-destructive")}>
        {formatCurrency(c.valor)}
      </span>
      {c.pago ? (
        <Badge variant="success" className="shrink-0">Pago</Badge>
      ) : (
        <Button size="sm" variant="outline" className="shrink-0" onClick={() => onBaixar(c)}>
          <Check className="h-3.5 w-3.5" /> Baixar
        </Button>
      )}
    </div>
  );
}

export function FinanceiroPage() {
  const [tab, setTab] = React.useState<TipoConta>("receber");
  const [open, setOpen] = React.useState(false);
  const [tipoForm, setTipoForm] = React.useState<TipoConta>("receber");
  const [form, setForm] = React.useState(EMPTY);

  const { data: receberData } = useContas({ tipo: "receber", size: 100 });
  const { data: pagarData } = useContas({ tipo: "pagar", size: 100 });
  const createMut = useCreateConta();
  const baixarMut = useBaixarConta();

  const receber = receberData?.items ?? [];
  const pagar = pagarData?.items ?? [];

  const aReceber = receber.filter((c) => !c.pago).reduce((a, c) => a + Number(c.valor), 0);
  const aPagar = pagar.filter((c) => !c.pago).reduce((a, c) => a + Number(c.valor), 0);
  const totalFluxo = aReceber + aPagar;
  const pctReceber = totalFluxo > 0 ? (aReceber / totalFluxo) * 100 : 50;

  const lista = tab === "receber" ? receber : pagar;
  const abertas = lista.filter((c) => !c.pago);
  const pagas = lista.filter((c) => c.pago);

  const grupos = (["vencidas", "hoje", "semana", "futuras"] as GrupoKey[])
    .map((key) => ({
      key,
      contas: abertas
        .filter((c) => grupoDe(diasAte(c.vencimento)) === key)
        .sort((a, b) => diasAte(a.vencimento) - diasAte(b.vencimento)),
    }))
    .filter((g) => g.contas.length > 0);

  async function baixar(c: ContaFinanceira) {
    const forma = prompt("Forma de pagamento (opcional):") ?? undefined;
    try {
      await baixarMut.mutateAsync({ id: c.id, forma_pagamento: forma || undefined });
      toast.success(c.tipo === "receber" ? "Recebimento baixado" : "Pagamento baixado");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível baixar"));
    }
  }

  function openNew(tipo: TipoConta) {
    setTipoForm(tipo);
    setForm(EMPTY);
    setOpen(true);
  }

  async function save() {
    if (!form.descricao || !form.vencimento || !form.valor) {
      return toast.error("Preencha descrição, vencimento e valor");
    }
    try {
      await createMut.mutateAsync({
        tipo: tipoForm,
        descricao: form.descricao,
        contraparte: form.contraparte || undefined,
        vencimento: form.vencimento,
        valor: form.valor,
      });
      toast.success("Lançamento registrado");
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível salvar"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader path="/financeiro" actions={<Button onClick={() => openNew(tab)}><Plus /> Novo lançamento</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="A receber" value={formatCurrency(aReceber)} icon={ArrowDownCircle} tone="success" />
        <StatCard label="A pagar" value={formatCurrency(aPagar)} icon={ArrowUpCircle} tone="destructive" />
        <StatCard label="Saldo projetado" value={formatCurrency(aReceber - aPagar)} icon={Wallet} tone={aReceber - aPagar >= 0 ? "success" : "destructive"} />
      </div>

      {/* ---- Barra de fluxo receber vs pagar ---- */}
      <div className="rounded-xl border bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-medium text-success">
            <span className="h-2 w-2 rounded-full bg-success" /> A receber {formatCurrency(aReceber)}
          </span>
          <span className="flex items-center gap-1.5 font-medium text-destructive">
            A pagar {formatCurrency(aPagar)} <span className="h-2 w-2 rounded-full bg-destructive" />
          </span>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-success transition-all" style={{ width: `${pctReceber}%` }} />
          <div className="h-full bg-destructive transition-all" style={{ width: `${100 - pctReceber}%` }} />
        </div>
      </div>

      {/* ---- Toggle receber/pagar ---- */}
      <div className="flex gap-1.5">
        <button
          onClick={() => setTab("receber")}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
            tab === "receber" ? "border-success/40 bg-success/10 text-success" : "text-muted-foreground hover:bg-muted",
          )}
        >
          <ArrowDownCircle className="h-4 w-4" /> Contas a receber
        </button>
        <button
          onClick={() => setTab("pagar")}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
            tab === "pagar" ? "border-destructive/40 bg-destructive/10 text-destructive" : "text-muted-foreground hover:bg-muted",
          )}
        >
          <ArrowUpCircle className="h-4 w-4" /> Contas a pagar
        </button>
      </div>

      {/* ---- Agenda por vencimento ---- */}
      <div className="space-y-5">
        {grupos.length === 0 && pagas.length === 0 && (
          <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
            Nenhum lançamento {tab === "receber" ? "a receber" : "a pagar"}.
          </p>
        )}
        {grupos.map((g) => (
          <div key={g.key} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", GRUPO_META[g.key].dot)} />
              <h3 className="text-sm font-semibold">{GRUPO_META[g.key].label}</h3>
              <span className="text-xs text-muted-foreground">
                ({g.contas.length}) · {formatCurrency(g.contas.reduce((a, c) => a + Number(c.valor), 0))}
              </span>
            </div>
            <div className="space-y-2">
              {g.contas.map((c) => (
                <LinhaConta key={c.id} c={c} onBaixar={baixar} />
              ))}
            </div>
          </div>
        ))}

        {pagas.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" />
              <h3 className="text-sm font-semibold text-muted-foreground">Já baixadas</h3>
              <span className="text-xs text-muted-foreground">({pagas.length})</span>
            </div>
            <div className="space-y-2 opacity-60">
              {pagas.slice(0, 10).map((c) => (
                <LinhaConta key={c.id} c={c} onBaixar={baixar} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo lançamento — {tipoForm === "receber" ? "a receber" : "a pagar"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={tipoForm} onChange={(e) => setTipoForm(e.target.value as TipoConta)}>
                <option value="receber">A receber</option>
                <option value="pagar">A pagar</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Descrição *</Label>
              <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>{tipoForm === "receber" ? "Cliente" : "Fornecedor"}</Label>
              <Input value={form.contraparte} onChange={(e) => setForm({ ...form, contraparte: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Vencimento *</Label>
                <Input type="date" value={form.vencimento} onChange={(e) => setForm({ ...form, vencimento: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Valor *</Label>
                <Input type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
              </div>
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
