import { CreditCard, Percent, Plus, TrendingUp, Wallet } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { DonutChart } from "@/components/charts";
import { PageHeader, StatCard } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatCurrency } from "@/lib/utils";

import { useCreateTransacaoCartao, useMarcarRecebido, useTransacoesCartao } from "./api";
import type { BandeiraCartao, TransacaoCartao } from "./types";

const BANDEIRA_COR: Record<BandeiraCartao, string> = {
  visa: "#2563eb",
  mastercard: "#f59e0b",
  elo: "#eab308",
  amex: "#0ea5e9",
  hipercard: "#dc2626",
};

const BANDEIRA_GRADIENT: Record<BandeiraCartao, string> = {
  visa: "from-blue-600 to-blue-800",
  mastercard: "from-amber-500 to-orange-700",
  elo: "from-yellow-500 to-amber-600",
  amex: "from-sky-500 to-sky-700",
  hipercard: "from-red-600 to-red-800",
};

const BANDEIRA_LABEL: Record<BandeiraCartao, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  elo: "Elo",
  amex: "Amex",
  hipercard: "Hipercard",
};

const EMPTY = { bandeira: "visa" as BandeiraCartao, adquirente: "Cielo", parcelas: "1", bruto: "", taxaPct: "" };

function CartaoTransacao({ t, onReceber }: { t: TransacaoCartao; onReceber: (id: number) => void }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br p-4 text-white shadow-md ${BANDEIRA_GRADIENT[t.bandeira]}`}>
      <div className="flex items-start justify-between">
        <span className="text-sm font-semibold tracking-wide">{BANDEIRA_LABEL[t.bandeira]}</span>
        <span className="text-xs opacity-80">{new Date(t.data).toLocaleDateString("pt-BR")}</span>
      </div>
      <p className="mt-4 text-xs opacity-80">{t.adquirente} · {t.parcelas}x</p>
      <div className="mt-1 flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wide opacity-70">Bruto</p>
          <p className="tnum text-lg font-bold">{formatCurrency(t.valor_bruto)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wide opacity-70">Líquido ({t.taxa_pct}%)</p>
          <p className="tnum text-sm font-semibold">{formatCurrency(t.valor_liquido)}</p>
        </div>
      </div>
      <div className="mt-3 border-t border-white/20 pt-2.5">
        {t.status === "recebido" ? (
          <Badge variant="secondary" className="bg-white/20 text-white">Recebido</Badge>
        ) : (
          <Button size="sm" variant="secondary" className="w-full bg-white/90 text-foreground hover:bg-white" onClick={() => onReceber(t.id)}>
            Confirmar recebimento
          </Button>
        )}
      </div>
    </div>
  );
}

export function CartoesPage() {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY);

  const { data } = useTransacoesCartao({ size: 100 });
  const createMut = useCreateTransacaoCartao();
  const receberMut = useMarcarRecebido();

  const items = data?.items ?? [];

  const bruto = items.reduce((a, t) => a + Number(t.valor_bruto), 0);
  const taxas = items.reduce((a, t) => a + (Number(t.valor_bruto) * Number(t.taxa_pct)) / 100, 0);
  const aReceber = items.filter((t) => t.status === "a_receber").reduce((a, t) => a + Number(t.valor_liquido), 0);
  const recebido = items.filter((t) => t.status === "recebido").reduce((a, t) => a + Number(t.valor_liquido), 0);

  const porBandeira = Object.entries(
    items.reduce<Record<string, number>>((acc, t) => {
      acc[t.bandeira] = (acc[t.bandeira] || 0) + Number(t.valor_bruto);
      return acc;
    }, {}),
  ).map(([label, value]) => ({ label: BANDEIRA_LABEL[label as BandeiraCartao], value, color: BANDEIRA_COR[label as BandeiraCartao] }));

  async function marcarRecebido(id: number) {
    try {
      await receberMut.mutateAsync(id);
      toast.success("Recebimento confirmado");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Nao foi possivel confirmar"));
    }
  }

  async function save() {
    if (!form.bruto) {
      toast.error("Informe o valor bruto");
      return;
    }
    const hoje = new Date().toISOString().slice(0, 10);
    try {
      await createMut.mutateAsync({
        data: hoje,
        bandeira: form.bandeira,
        adquirente: form.adquirente,
        parcelas: Number(form.parcelas) || 1,
        valor_bruto: form.bruto,
        taxa_pct: form.taxaPct || "2.5",
        previsao_recebimento: hoje,
      });
      toast.success("Transação lançada");
      setForm(EMPTY);
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Nao foi possivel salvar"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        path="/cartoes"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus /> Nova transação
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Faturamento bruto" value={formatCurrency(bruto)} icon={CreditCard} />
        <StatCard label="Taxas do período" value={formatCurrency(taxas)} icon={Percent} tone="destructive" />
        <StatCard label="Líquido a receber" value={formatCurrency(aReceber)} icon={Wallet} tone="warning" />
        <StatCard label="Já recebido" value={formatCurrency(recebido)} icon={TrendingUp} tone="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {items.length === 0 ? (
            <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
              Nenhuma transação lançada.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {items.map((t) => (
                <CartaoTransacao key={t.id} t={t} onReceber={marcarRecebido} />
              ))}
            </div>
          )}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Faturamento por bandeira</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={porBandeira} />
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova transação de cartão</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Bandeira</Label>
              <Select value={form.bandeira} onChange={(e) => setForm({ ...form, bandeira: e.target.value as BandeiraCartao })}>
                {Object.entries(BANDEIRA_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Adquirente</Label>
              <Select value={form.adquirente} onChange={(e) => setForm({ ...form, adquirente: e.target.value })}>
                <option>Cielo</option>
                <option>Rede</option>
                <option>Stone</option>
                <option>GetNet</option>
                <option>PagSeguro</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Valor bruto *</Label>
              <Input type="number" value={form.bruto} onChange={(e) => setForm({ ...form, bruto: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Parcelas</Label>
              <Input type="number" min={1} value={form.parcelas} onChange={(e) => setForm({ ...form, parcelas: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Taxa (%)</Label>
              <Input type="number" step="0.1" value={form.taxaPct} onChange={(e) => setForm({ ...form, taxaPct: e.target.value })} />
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
