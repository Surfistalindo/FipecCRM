import { ChevronRight, FolderTree, Package, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader, StatCard } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

import { useCategorias, useCreateCategoria, useDeleteCategoria } from "./api";
import type { Categoria, CategoriaNode } from "./types";

function buildTree(categorias: Categoria[]): CategoriaNode[] {
  const byId = new Map<number, CategoriaNode>(
    categorias.map((c) => [c.id, { ...c, filhos: [] }]),
  );
  const roots: CategoriaNode[] = [];
  for (const node of byId.values()) {
    if (node.categoria_pai_id && byId.has(node.categoria_pai_id)) {
      byId.get(node.categoria_pai_id)!.filhos.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function Node({
  node,
  depth,
  onAddChild,
  onDelete,
}: {
  node: CategoriaNode;
  depth: number;
  onAddChild: (pai: CategoriaNode) => void;
  onDelete: (node: CategoriaNode) => void;
}) {
  const [open, setOpen] = React.useState(true);
  const hasFilhos = node.filhos.length > 0;

  return (
    <div>
      <div
        className="group flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-muted/50"
        style={{ paddingLeft: depth * 20 + 8 }}
      >
        <button
          className="flex flex-1 items-center gap-2 text-left"
          onClick={() => hasFilhos && setOpen((v) => !v)}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              hasFilhos && open && "rotate-90",
              !hasFilhos && "opacity-0",
            )}
          />
          <FolderTree className="h-4 w-4 shrink-0 text-primary" />
          <span className="font-medium">{node.nome}</span>
          <Badge variant="secondary" className="ml-1">
            {node.produtos_count} produtos
          </Badge>
        </button>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button size="sm" variant="ghost" onClick={() => onAddChild(node)}>
            <Plus className="h-3.5 w-3.5" /> Subcategoria
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onDelete(node)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
      {hasFilhos && open && (
        <div>
          {node.filhos.map((filho) => (
            <Node key={filho.id} node={filho} depth={depth + 1} onAddChild={onAddChild} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoriasPage() {
  const { data: categorias = [], isLoading } = useCategorias();
  const createMut = useCreateCategoria();
  const deleteMut = useDeleteCategoria();

  const [open, setOpen] = React.useState(false);
  const [nome, setNome] = React.useState("");
  const [paiId, setPaiId] = React.useState<string>("");

  const tree = React.useMemo(() => buildTree(categorias), [categorias]);
  const totalProdutosVinculados = categorias.reduce((acc, c) => acc + c.produtos_count, 0);

  function abrirNova(pai?: Categoria) {
    setNome("");
    setPaiId(pai ? String(pai.id) : "");
    setOpen(true);
  }

  async function salvar() {
    if (!nome.trim()) {
      toast.error("Informe o nome da categoria");
      return;
    }
    try {
      await createMut.mutateAsync({
        nome: nome.trim(),
        categoria_pai_id: paiId ? Number(paiId) : null,
      });
      toast.success("Categoria criada");
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível criar a categoria"));
    }
  }

  async function remover(categoria: CategoriaNode) {
    try {
      await deleteMut.mutateAsync(categoria.id);
      toast.success("Categoria removida");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível remover a categoria"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        path="/categorias"
        actions={
          <Button onClick={() => abrirNova()}>
            <Plus /> Nova categoria
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Categorias raiz" value={tree.length} icon={FolderTree} />
        <StatCard label="Total de categorias" value={categorias.length} icon={FolderTree} />
        <StatCard label="Produtos vinculados" value={totalProdutosVinculados} icon={Package} />
      </div>

      <Card>
        <CardContent className="p-3">
          {isLoading && (
            <p className="p-6 text-center text-sm text-muted-foreground">Carregando categorias...</p>
          )}
          {!isLoading && tree.length === 0 && (
            <p className="p-10 text-center text-sm text-muted-foreground">
              Nenhuma categoria cadastrada ainda.
            </p>
          )}
          {!isLoading &&
            tree.map((node) => (
              <Node key={node.id} node={node} depth={0} onAddChild={abrirNova} onDelete={remover} />
            ))}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Freios" />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria pai</Label>
              <Select value={paiId} onChange={(e) => setPaiId(e.target.value)}>
                <option value="">Nenhuma (categoria raiz)</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={salvar} disabled={createMut.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
