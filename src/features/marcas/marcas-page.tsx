import { Plus, Search, Tag, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
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

import { useCreateMarca, useDeleteMarca, useMarcas } from "./api";

const CORES = ["#2563eb", "#7c3aed", "#059669", "#dc2626", "#d97706", "#0891b2", "#db2777", "#4f46e5"];

export function MarcasPage() {
  const { data: marcas = [], isLoading } = useMarcas();
  const createMut = useCreateMarca();
  const deleteMut = useDeleteMarca();

  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [nome, setNome] = React.useState("");

  const filtered = marcas.filter((m) => m.nome.toLowerCase().includes(search.toLowerCase()));

  async function salvar() {
    if (!nome.trim()) {
      toast.error("Informe o nome da marca");
      return;
    }
    try {
      await createMut.mutateAsync({ nome: nome.trim(), cor: CORES[marcas.length % CORES.length] });
      toast.success("Marca criada");
      setNome("");
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível criar a marca"));
    }
  }

  async function remover(id: number) {
    try {
      await deleteMut.mutateAsync(id);
      toast.success("Marca removida");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível remover a marca"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        path="/marcas"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus /> Nova marca
          </Button>
        }
      />
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar marca..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando marcas...</p>}
      {!isLoading && filtered.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma marca cadastrada ainda.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="group relative flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-md"
          >
            <button
              onClick={() => remover(m.id)}
              className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white"
              style={{ backgroundColor: m.cor ?? "#64748b" }}
            >
              {m.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{m.nome}</p>
              <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Tag className="h-3 w-3" /> {m.produtos_count} produtos
              </p>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova marca</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Nome *</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Bosch" />
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
