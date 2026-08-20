import { Building2, MapPin, Phone, Plus, Search, Star, Trash2, Truck } from "lucide-react";
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

import { useCreateFornecedor, useDeleteFornecedor, useFornecedores } from "./api";
import type { Fornecedor } from "./types";

const EMPTY = { razao_social: "", nome_fantasia: "", cnpj: "", categoria: "", cidade: "", uf: "", contato: "" };

function CartaoFornecedor({ f, onDelete }: { f: Fornecedor; onDelete: (f: Fornecedor) => void }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className={cn("h-1.5 w-full", f.ativo ? "bg-primary" : "bg-muted")} />
      <button
        onClick={() => onDelete(f)}
        className="absolute right-3 top-4 z-10 hidden rounded-md bg-background/80 p-1.5 text-muted-foreground backdrop-blur transition-colors hover:text-destructive group-hover:block"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <div className="flex-1 space-y-3 p-4">
        <div>
          <p className="font-semibold leading-tight">{f.nome_fantasia || f.razao_social}</p>
          {f.nome_fantasia && <p className="text-xs text-muted-foreground">{f.razao_social}</p>}
          <p className="mt-1 font-mono text-xs text-muted-foreground">{formatDocumento(f.cnpj)}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {f.categoria && <Badge variant="secondary">{f.categoria}</Badge>}
          <Badge variant={f.ativo ? "success" : "secondary"}>{f.ativo ? "Ativo" : "Inativo"}</Badge>
        </div>

        <div className="space-y-1.5 border-t pt-3 text-xs text-muted-foreground">
          {f.cidade && (
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" /> {f.cidade}/{f.uf}
            </p>
          )}
          {f.contato && (
            <p className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 shrink-0" /> {f.contato}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn("h-3.5 w-3.5", i < f.avaliacao ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
            ))}
          </div>
          <p className="text-sm font-semibold tnum">{formatCurrency(f.total_compras)}</p>
        </div>
      </div>
    </div>
  );
}

export function FornecedoresPage() {
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError } = useFornecedores({ size: 100, search: debounced || undefined });
  const createMut = useCreateFornecedor();
  const deleteMut = useDeleteFornecedor();

  const items = data?.items ?? [];
  const ativos = items.filter((f) => f.ativo).length;
  const totalCompras = items.reduce((a, f) => a + Number(f.total_compras), 0);
  const categorias = new Set(items.map((f) => f.categoria).filter(Boolean)).size;

  async function save() {
    if (!form.razao_social) return toast.error("Informe a razão social");
    try {
      await createMut.mutateAsync({
        razao_social: form.razao_social,
        nome_fantasia: form.nome_fantasia || null,
        cnpj: form.cnpj || null,
        categoria: form.categoria || null,
        contato: form.contato || null,
        cidade: form.cidade || null,
        uf: form.uf || null,
      });
      toast.success("Fornecedor cadastrado");
      setForm(EMPTY);
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível salvar"));
    }
  }

  async function handleDelete(f: Fornecedor) {
    if (!confirm(`Excluir o fornecedor "${f.razao_social}"?`)) return;
    try {
      await deleteMut.mutateAsync(f.id);
      toast.success("Fornecedor excluído");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível excluir"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        path="/fornecedores"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus /> Novo fornecedor
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Fornecedores ativos" value={ativos} icon={Building2} />
        <StatCard label="Total em compras" value={formatCurrency(totalCompras)} icon={Truck} tone="success" />
        <StatCard label="Categorias" value={categorias} icon={Star} tone="warning" />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por razão, fantasia ou CNPJ..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && <p className="py-16 text-center text-sm text-muted-foreground">Carregando...</p>}
      {isError && <p className="py-16 text-center text-sm text-destructive">Erro ao carregar fornecedores.</p>}
      {!isLoading && items.length === 0 && (
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Nenhum fornecedor cadastrado.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((f) => (
          <CartaoFornecedor key={f.id} f={f} onDelete={handleDelete} />
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo fornecedor</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Razão social *</Label>
              <Input value={form.razao_social} onChange={(e) => setForm({ ...form, razao_social: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Nome fantasia</Label>
              <Input value={form.nome_fantasia} onChange={(e) => setForm({ ...form, nome_fantasia: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>CNPJ</Label>
              <Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Contato</Label>
              <Input value={form.contato} onChange={(e) => setForm({ ...form, contato: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Cidade</Label>
              <Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>UF</Label>
              <Input maxLength={2} value={form.uf} onChange={(e) => setForm({ ...form, uf: e.target.value.toUpperCase() })} />
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
