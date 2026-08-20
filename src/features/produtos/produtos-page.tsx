import { AlertTriangle, LayoutGrid, Package, Plus, Search, Trash2, TrendingUp } from "lucide-react";
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
import { useCategorias } from "@/features/categorias/api";
import { useMarcas } from "@/features/marcas/api";
import { apiErrorMessage } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";

import { useCreateProduto, useDeleteProduto, useProdutos } from "./api";
import type { Produto } from "./types";

const CORES = ["#2563eb", "#7c3aed", "#059669", "#dc2626", "#d97706", "#0891b2"];
const cor = (id: number) => CORES[id % CORES.length];

const EMPTY = { nome: "", codigo: "", categoria: "", marca: "", preco_custo: "", preco_venda: "", estoque: "" };

export function ProdutosPage() {
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [cat, setCat] = React.useState("todas");
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError } = useProdutos({ size: 100, search: debounced || undefined });
  const { data: categoriasReais = [] } = useCategorias();
  const { data: marcasReais = [] } = useMarcas();
  const createMut = useCreateProduto();
  const deleteMut = useDeleteProduto();

  const items = data?.items ?? [];
  const categorias = ["todas", ...Array.from(new Set(items.map((p) => p.categoria).filter(Boolean)))] as string[];
  const filtered = items.filter((p) => cat === "todas" || p.categoria === cat);

  const baixoEstoque = items.filter((p) => Number(p.estoque) <= Number(p.estoque_minimo)).length;
  const valorEstoque = items.reduce((a, p) => a + Number(p.preco_custo) * Number(p.estoque), 0);

  async function save() {
    if (!form.nome) return toast.error("Informe o nome");
    try {
      await createMut.mutateAsync({
        nome: form.nome,
        codigo: form.codigo || null,
        categoria: form.categoria || null,
        marca: form.marca || null,
        preco_custo: form.preco_custo || "0",
        preco_venda: form.preco_venda || "0",
        estoque: form.estoque || "0",
      });
      toast.success("Produto cadastrado");
      setForm(EMPTY);
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível salvar"));
    }
  }

  async function handleDelete(p: Produto) {
    if (!confirm(`Excluir o produto "${p.nome}"?`)) return;
    try {
      await deleteMut.mutateAsync(p.id);
      toast.success("Produto excluído");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível excluir"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        path="/produtos"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus /> Novo produto
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Produtos" value={data?.total ?? 0} icon={Package} />
        <StatCard label="Valor em estoque" value={formatCurrency(valorEstoque)} icon={TrendingUp} tone="success" />
        <StatCard label="Estoque baixo" value={baixoEstoque} icon={AlertTriangle} tone="destructive" hint="produtos abaixo do mínimo" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar produto ou código..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={cat} onChange={(e) => setCat(e.target.value)} className="sm:w-52">
          {categorias.map((c) => (
            <option key={c} value={c}>{c === "todas" ? "Todas as categorias" : c}</option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-muted-foreground">Carregando...</div>
      ) : isError ? (
        <div className="py-16 text-center text-destructive">Erro ao carregar produtos.</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <LayoutGrid className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Nenhum produto encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => {
            const venda = Number(p.preco_venda);
            const custo = Number(p.preco_custo);
            const estoque = Number(p.estoque);
            const minimo = Number(p.estoque_minimo);
            const maximo = Number(p.estoque_maximo) || Math.max(minimo * 3, estoque, 1);
            const margem = venda > 0 ? ((venda - custo) / venda) * 100 : 0;
            const baixo = estoque <= minimo;
            const nivelEstoquePct = Math.min((estoque / maximo) * 100, 100);
            return (
              <div
                key={p.id}
                className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <button
                  onClick={() => handleDelete(p)}
                  className="absolute right-3 top-3 z-10 hidden rounded-md bg-background/80 p-1.5 text-muted-foreground backdrop-blur transition-colors hover:text-destructive group-hover:block"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="flex items-start gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white"
                    style={{ backgroundColor: cor(p.id) }}
                  >
                    {p.nome.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium leading-tight">{p.nome}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {p.codigo ?? "s/ código"} {p.marca ? `· ${p.marca}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-lg font-bold tnum">{formatCurrency(venda)}</p>
                    <p className="text-xs text-muted-foreground">custo {formatCurrency(custo)}</p>
                  </div>
                  {baixo && <Badge variant="destructive">estoque baixo</Badge>}
                  {!baixo && p.categoria && <Badge variant="secondary">{p.categoria}</Badge>}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Margem</span>
                    <span className="tnum font-medium text-foreground">{margem.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", margem >= 30 ? "bg-success" : margem >= 10 ? "bg-amber-500" : "bg-destructive")}
                      style={{ width: `${Math.max(Math.min(margem, 100), 3)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Estoque</span>
                    <span className={cn("tnum font-medium", baixo ? "text-destructive" : "text-foreground")}>
                      {estoque} un {minimo ? `(mín. ${minimo})` : ""}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", baixo ? "bg-destructive" : "bg-primary")}
                      style={{ width: `${Math.max(nivelEstoquePct, 3)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo produto</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Código</Label>
              <Input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                <option value="">Sem categoria</option>
                {categoriasReais.map((c) => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Marca</Label>
              <Select value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })}>
                <option value="">Sem marca</option>
                {marcasReais.map((m) => (
                  <option key={m.id} value={m.nome}>{m.nome}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Custo</Label>
              <Input type="number" value={form.preco_custo} onChange={(e) => setForm({ ...form, preco_custo: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Preço de venda</Label>
              <Input type="number" value={form.preco_venda} onChange={(e) => setForm({ ...form, preco_venda: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Estoque inicial</Label>
              <Input type="number" value={form.estoque} onChange={(e) => setForm({ ...form, estoque: e.target.value })} />
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
