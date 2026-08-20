import { AlertTriangle, Banknote, CheckCircle2, Plus, Wallet } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader, StatCard } from "@/components/page-header";
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

import { useCheques, useCreateCheque, useMudarStatusCheque } from "./api";
import type { Cheque, StatusCheque, TipoCheque } from "./types";

const STATUS_LABEL: Record<StatusCheque, string> = {
  em_carteira: "Em carteira",
  depositado: "Depositado",
  compensado: "Compensado",
  devolvido: "Devolvido",
};

const STATUS_STAMP: Record<StatusCheque, string> = {
  em_carteira: "border-amber-500/50 text-amber-500",
  depositado: "border-primary/50 text-primary",
  compensado: "border-success/50 text-success",
  devolvido: "border-destructive/50 text-destructive",
};

const EMPTY = { numero: "", banco: "", pessoa: "", valor: "", bomPara: "" };

function ChequeCard({
  c,
  tipo,
  onCompensar,
  onDevolver,
}: {
  c: Cheque;
  tipo: TipoCheque;
  onCompensar: (id: number) => void;
  onDevolver: (id: number) => void;
}) {
  const acionavel = c.status !== "compensado" && c.status !== "devolvido";
  return (
    <div className="relative overflow-hidden rounded-xl border-2 bg-gradient-to-br from-card to-muted/30 p-4 shadow-sm">
      {/* faixa lateral tipo cheque */}
      <div className="absolute inset-y-0 left-0 w-1.5 bg-primary/70" />
      {/* carimbo de status */}
      <span
        className={cn(
          "absolute right-3 top-3 rotate-6 rounded border-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
          STATUS_STAMP[c.status],
        )}
      >
        {STATUS_LABEL[c.status]}
      </span>

      <div className="pl-3">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{c.banco || "Banco"}</span>
          <span className="font-mono text-xs text-muted-foreground">nº {c.numero}</span>
        </div>

        <p className="mt-3 text-[10px] uppercase tracking-wide text-muted-foreground">
          {tipo === "recebido" ? "Emitente" : "Favorecido"}
        </p>
        <p className="truncate text-sm font-medium">{c.pessoa || "—"}</p>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Bom para</p>
            <p className="font-mono text-sm">{new Date(c.bom_para).toLocaleDateString("pt-BR")}</p>
          </div>
          <p className="tnum text-xl font-bold">{formatCurrency(c.valor)}</p>
        </div>

        {acionavel && (
          <div className="mt-3 flex gap-1.5 border-t pt-3">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => onCompensar(c.id)}>
              Compensar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDevolver(c.id)}>
              Devolver
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ChequesPage() {
  const [tab, setTab] = React.useState<TipoCheque>("recebido");
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY);

  const { data } = useCheques({ size: 100, tipo: tab });
  const createMut = useCreateCheque();
  const statusMut = useMudarStatusCheque();

  const items = data?.items ?? [];

  const emCarteira = items.filter((c) => c.status === "em_carteira").reduce((a, c) => a + Number(c.valor), 0);
  const aCompensar = items.filter((c) => c.status === "depositado").reduce((a, c) => a + Number(c.valor), 0);
  const compensados = items.filter((c) => c.status === "compensado").reduce((a, c) => a + Number(c.valor), 0);
  const devolvidos = items.filter((c) => c.status === "devolvido").length;

  async function updateStatus(id: number, status: StatusCheque) {
    try {
      await statusMut.mutateAsync({ id, status });
      toast.success(`Cheque atualizado: ${STATUS_LABEL[status]}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Nao foi possivel atualizar"));
    }
  }

  async function save() {
    if (!form.numero || !form.valor) {
      toast.error("Informe numero e valor do cheque");
      return;
    }
    try {
      await createMut.mutateAsync({
        tipo: tab,
        numero: form.numero,
        banco: form.banco || undefined,
        pessoa: form.pessoa || undefined,
        valor: form.valor,
        bom_para: form.bomPara || new Date().toISOString().slice(0, 10),
      });
      toast.success("Cheque lancado");
      setForm(EMPTY);
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Nao foi possivel salvar"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader path="/cheques" actions={<Button onClick={() => setOpen(true)}><Plus /> Lançar cheque</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Em carteira" value={formatCurrency(emCarteira)} icon={Wallet} tone="warning" />
        <StatCard label="A compensar" value={formatCurrency(aCompensar)} icon={Banknote} />
        <StatCard label="Compensados" value={formatCurrency(compensados)} icon={CheckCircle2} tone="success" />
        <StatCard label="Devolvidos" value={devolvidos} icon={AlertTriangle} tone="destructive" />
      </div>

      <div className="flex gap-1.5">
        {(["recebido", "emitido"] as TipoCheque[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
              tab === t ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {t === "recebido" ? "Recebidos" : "Emitidos"}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Nenhum cheque lançado.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <ChequeCard key={c.id} c={c} tipo={tab} onCompensar={(id) => updateStatus(id, "compensado")} onDevolver={(id) => updateStatus(id, "devolvido")} />
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lançar cheque {tab === "recebido" ? "recebido" : "emitido"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Número *</Label>
              <Input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Banco</Label>
              <Select value={form.banco} onChange={(e) => setForm({ ...form, banco: e.target.value })}>
                <option value="">Selecione</option>
                <option>Banco do Brasil</option>
                <option>Itaú</option>
                <option>Bradesco</option>
                <option>Santander</option>
                <option>Caixa</option>
                <option>Nubank</option>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>{tab === "recebido" ? "Emitente" : "Favorecido"}</Label>
              <Input value={form.pessoa} onChange={(e) => setForm({ ...form, pessoa: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Valor *</Label>
              <Input type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Bom para</Label>
              <Input type="date" value={form.bomPara} onChange={(e) => setForm({ ...form, bomPara: e.target.value })} />
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
