import { Check, Clock, Copy, Plus, TriangleAlert } from "lucide-react";
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
import { formatDate } from "@/lib/format";
import { cn, formatCurrency } from "@/lib/utils";

import { useBoletos, useCreateBoleto, usePagarBoleto } from "./api";
import type { Boleto, StatusBoleto } from "./types";

const STATUS_META: Record<StatusBoleto, { label: string; variant: "default" | "success" | "destructive" }> = {
  registrado: { label: "Registrado", variant: "default" },
  pago: { label: "Pago", variant: "success" },
  vencido: { label: "Vencido", variant: "destructive" },
};

const EMPTY = { sacado: "", valor: "", vencimento: "" };

// Codigo de barras decorativo, determinístico a partir da linha digitável
function Barras({ seed }: { seed: string }) {
  const barras = React.useMemo(() => {
    return Array.from({ length: 48 }).map((_, i) => {
      const code = seed.charCodeAt(i % seed.length) + i;
      return (code % 3) + 1; // largura 1-3
    });
  }, [seed]);
  return (
    <div className="flex h-9 items-stretch gap-[1px]">
      {barras.map((w, i) => (
        <span key={i} className={cn(i % 2 === 0 ? "bg-foreground" : "bg-transparent")} style={{ width: w }} />
      ))}
    </div>
  );
}

function BoletoCard({ b, onPagar }: { b: Boleto; onPagar: (id: number) => void }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-dashed px-4 py-3">
        <div>
          <p className="text-sm font-semibold">{b.sacado}</p>
          <p className="text-xs text-muted-foreground">Vencimento {formatDate(b.vencimento)}</p>
        </div>
        <div className="text-right">
          <p className="tnum text-lg font-bold">{formatCurrency(b.valor)}</p>
          <Badge variant={STATUS_META[b.status].variant}>{STATUS_META[b.status].label}</Badge>
        </div>
      </div>
      <div className="space-y-2 p-4">
        <Barras seed={b.linha_digitavel} />
        <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">{b.linha_digitavel}</p>
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => {
              navigator.clipboard?.writeText(b.linha_digitavel);
              toast.success("Linha digitável copiada");
            }}
          >
            <Copy className="h-3.5 w-3.5" /> Copiar linha
          </Button>
          {b.status !== "pago" && (
            <Button size="sm" className="flex-1" onClick={() => onPagar(b.id)}>
              <Check className="h-3.5 w-3.5" /> Confirmar pagamento
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function BoletosPage() {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY);

  const { data } = useBoletos();
  const createMut = useCreateBoleto();
  const pagarMut = usePagarBoleto();

  const items = data?.items ?? [];

  async function pagar(id: number) {
    try {
      await pagarMut.mutateAsync(id);
      toast.success("Boleto marcado como pago");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Nao foi possivel confirmar"));
    }
  }

  async function gerar() {
    if (!form.sacado || !form.valor || !form.vencimento) {
      toast.error("Preencha sacado, valor e vencimento");
      return;
    }
    try {
      await createMut.mutateAsync(form);
      toast.success("Boleto gerado e registrado no banco (simulado)");
      setForm(EMPTY);
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Nao foi possivel gerar"));
    }
  }

  const aReceber = items.filter((b) => b.status !== "pago").reduce((a, b) => a + Number(b.valor), 0);

  return (
    <div className="space-y-6">
      <PageHeader path="/boletos" actions={<Button onClick={() => setOpen(true)}><Plus /> Gerar boleto</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Em aberto" value={formatCurrency(aReceber)} icon={Clock} tone="warning" />
        <StatCard label="Vencidos" value={items.filter((b) => b.status === "vencido").length} icon={TriangleAlert} tone="destructive" />
        <StatCard label="Pagos" value={items.filter((b) => b.status === "pago").length} icon={Check} tone="success" />
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Nenhum boleto gerado.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {items.map((b) => (
            <BoletoCard key={b.id} b={b} onPagar={pagar} />
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Gerar boleto</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Sacado *</Label><Input value={form.sacado} onChange={(e) => setForm({ ...form, sacado: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Valor *</Label><Input type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Vencimento *</Label><Input type="date" value={form.vencimento} onChange={(e) => setForm({ ...form, vencimento: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={gerar} disabled={createMut.isPending}>Gerar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
