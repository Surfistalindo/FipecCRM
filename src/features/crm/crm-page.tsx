import { DollarSign, Plus, Target, TrendingUp } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader, StatCard } from "@/components/page-header";
import { Avatar } from "@/components/ui/avatar";
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
import { formatCurrency } from "@/lib/utils";

import { useAvancarOportunidade, useCreateOportunidade, useOportunidades } from "./api";
import type { EtapaOportunidade } from "./types";

const ETAPAS: { key: EtapaOportunidade; label: string; accent: string }[] = [
  { key: "lead", label: "Leads", accent: "border-t-slate-400" },
  { key: "contato", label: "Em contato", accent: "border-t-blue-500" },
  { key: "proposta", label: "Proposta enviada", accent: "border-t-amber-500" },
  { key: "ganho", label: "Ganhos", accent: "border-t-emerald-500" },
];

const EMPTY = { empresa: "", responsavel: "", valor: "" };

export function CrmPage() {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY);

  const { data } = useOportunidades();
  const createMut = useCreateOportunidade();
  const avancarMut = useAvancarOportunidade();

  const deals = (data?.items ?? []).filter((d) => d.etapa !== "perdido");

  async function avancar(id: number, etapa: EtapaOportunidade) {
    if (etapa === "ganho") return;
    try {
      const res = await avancarMut.mutateAsync(id);
      toast.success(`Avançou para ${ETAPAS.find((e) => e.key === res.etapa)?.label ?? res.etapa}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Nao foi possivel avancar"));
    }
  }

  async function save() {
    if (!form.empresa || !form.valor) {
      toast.error("Informe empresa e valor");
      return;
    }
    try {
      await createMut.mutateAsync({ empresa: form.empresa, responsavel: form.responsavel || undefined, valor: form.valor });
      toast.success("Oportunidade criada");
      setForm(EMPTY);
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Nao foi possivel salvar"));
    }
  }

  const pipeline = deals.filter((d) => d.etapa !== "ganho").reduce((a, d) => a + Number(d.valor), 0);
  const ganhos = deals.filter((d) => d.etapa === "ganho").reduce((a, d) => a + Number(d.valor), 0);

  return (
    <div className="space-y-6">
      <PageHeader path="/crm" actions={<Button onClick={() => setOpen(true)}><Plus /> Nova oportunidade</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pipeline aberto" value={formatCurrency(pipeline)} icon={Target} tone="warning" />
        <StatCard label="Ganhos" value={formatCurrency(ganhos)} icon={DollarSign} tone="success" />
        <StatCard label="Oportunidades" value={deals.length} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ETAPAS.map((etapa) => {
          const list = deals.filter((d) => d.etapa === etapa.key);
          const total = list.reduce((a, d) => a + Number(d.valor), 0);
          return (
            <div key={etapa.key} className={`rounded-xl border border-t-4 bg-muted/30 p-3 ${etapa.accent}`}>
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="text-sm font-semibold">{etapa.label}</span>
                <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium">{list.length}</span>
              </div>
              <div className="space-y-2">
                {list.map((d) => (
                  <div key={d.id} className="cursor-pointer rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md" onClick={() => avancar(d.id, d.etapa)}>
                    <div className="flex items-center gap-2">
                      <Avatar name={d.empresa} className="h-7 w-7 text-[10px]" />
                      <p className="truncate text-sm font-medium">{d.empresa}</p>
                    </div>
                    <p className="mt-2 text-sm font-bold">{formatCurrency(d.valor)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t px-1 pt-2 text-xs text-muted-foreground">{formatCurrency(total)}</div>
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-muted-foreground">Clique em um card para avançar a oportunidade no funil.</p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova oportunidade</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Empresa *</Label><Input value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Responsável</Label><Input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Valor *</Label><Input type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} /></div>
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
