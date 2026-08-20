import { Clock, MapPin, Phone, Plus, Search, Trash2, Truck } from "lucide-react";
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
import { cn, formatCurrency, formatDocumento } from "@/lib/utils";

import { useCreateTransportadora, useDeleteTransportadora, useTransportadoras } from "./api";
import type { Transportadora } from "./types";

const EMPTY = { razao_social: "", cnpj: "", cidade: "", uf: "", regioes: "", prazo_medio_dias: "", frete_minimo: "", contato: "" };

function velocidadeCor(dias: number) {
  if (dias <= 2) return "text-success";
  if (dias <= 5) return "text-amber-500";
  return "text-destructive";
}

function CartaoTransportadora({ t, onDelete }: { t: Transportadora; onDelete: (t: Transportadora) => void }) {
  return (
    <div className="group relative flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className={cn("flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border-2", velocidadeCor(t.prazo_medio_dias), "border-current/20 bg-current/5")}>
        <Truck className={cn("h-5 w-5", velocidadeCor(t.prazo_medio_dias))} />
        <span className={cn("tnum text-[11px] font-bold", velocidadeCor(t.prazo_medio_dias))}>{t.prazo_medio_dias}d</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{t.razao_social}</p>
          <Badge variant={t.ativo ? "success" : "secondary"} className="shrink-0">
            {t.ativo ? "Ativa" : "Inativa"}
          </Badge>
        </div>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{formatDocumento(t.cnpj)}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {t.cidade && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {t.cidade}/{t.uf}
            </span>
          )}
          {t.contato && (
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" /> {t.contato}
            </span>
          )}
        </div>
        {t.regioes && (
          <div className="mt-2 flex flex-wrap gap-1">
            {t.regioes.split(",").map((r) => (
              <Badge key={r} variant="secondary" className="text-[10px]">
                {r.trim()}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Frete mínimo</p>
          <p className="tnum text-sm font-semibold">{formatCurrency(t.frete_minimo)}</p>
        </div>
        <button
          onClick={() => onDelete(t)}
          className="hidden rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive group-hover:block"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function TransportadorasPage() {
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError } = useTransportadoras({ size: 100, search: debounced || undefined });
  const createMut = useCreateTransportadora();
  const deleteMut = useDeleteTransportadora();

  const items = data?.items ?? [];
  const ativas = items.filter((t) => t.ativo).length;
  const prazoMedio = items.length
    ? (items.reduce((a, t) => a + t.prazo_medio_dias, 0) / items.length).toFixed(1)
    : "0";
  const freteMedio = items.length
    ? items.reduce((a, t) => a + Number(t.frete_minimo), 0) / items.length
    : 0;

  async function save() {
    if (!form.razao_social) return toast.error("Informe a razão social");
    try {
      await createMut.mutateAsync({
        razao_social: form.razao_social,
        cnpj: form.cnpj || null,
        cidade: form.cidade || null,
        uf: form.uf || null,
        regioes: form.regioes || null,
        contato: form.contato || null,
        prazo_medio_dias: form.prazo_medio_dias || "3",
        frete_minimo: form.frete_minimo || "0",
      });
      toast.success("Transportadora cadastrada");
      setForm(EMPTY);
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível salvar"));
    }
  }

  async function handleDelete(t: Transportadora) {
    if (!confirm(`Excluir a transportadora "${t.razao_social}"?`)) return;
    try {
      await deleteMut.mutateAsync(t.id);
      toast.success("Transportadora excluída");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível excluir"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        path="/transportadoras"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus /> Nova transportadora
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Transportadoras ativas" value={ativas} icon={Truck} />
        <StatCard label="Prazo médio" value={`${prazoMedio} dias`} icon={Clock} tone="warning" />
        <StatCard label="Frete mínimo médio" value={formatCurrency(freteMedio)} icon={MapPin} tone="success" />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por razão, CNPJ ou região..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && <p className="py-16 text-center text-sm text-muted-foreground">Carregando...</p>}
      {isError && <p className="py-16 text-center text-sm text-destructive">Erro ao carregar transportadoras.</p>}
      {!isLoading && items.length === 0 && (
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Nenhuma transportadora cadastrada.
        </p>
      )}

      <div className="space-y-3">
        {items.map((t) => (
          <CartaoTransportadora key={t.id} t={t} onDelete={handleDelete} />
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova transportadora</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Razão social *</Label>
              <Input value={form.razao_social} onChange={(e) => setForm({ ...form, razao_social: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>CNPJ</Label>
              <Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Regiões atendidas</Label>
              <Input value={form.regioes} onChange={(e) => setForm({ ...form, regioes: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Cidade</Label>
              <Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>UF</Label>
              <Input maxLength={2} value={form.uf} onChange={(e) => setForm({ ...form, uf: e.target.value.toUpperCase() })} />
            </div>
            <div className="space-y-1.5">
              <Label>Prazo médio (dias)</Label>
              <Input type="number" value={form.prazo_medio_dias} onChange={(e) => setForm({ ...form, prazo_medio_dias: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Frete mínimo (R$)</Label>
              <Input type="number" value={form.frete_minimo} onChange={(e) => setForm({ ...form, frete_minimo: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Contato</Label>
              <Input value={form.contato} onChange={(e) => setForm({ ...form, contato: e.target.value })} />
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
