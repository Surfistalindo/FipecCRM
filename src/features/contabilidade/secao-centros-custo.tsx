import { Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiErrorMessage } from "@/lib/api";

import { useCentrosCusto, useCreateCentroCusto, useDeleteCentroCusto } from "./api";

const EMPTY = { codigo: "", nome: "" };

export function SecaoCentrosCusto() {
  const { data: centros = [], isLoading } = useCentrosCusto();
  const createMut = useCreateCentroCusto();
  const deleteMut = useDeleteCentroCusto();

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY);

  async function salvar() {
    if (!form.codigo.trim() || !form.nome.trim()) {
      toast.error("Informe código e nome");
      return;
    }
    try {
      await createMut.mutateAsync(form);
      toast.success("Centro de custo criado");
      setForm(EMPTY);
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível criar"));
    }
  }

  async function remover(id: number) {
    try {
      await deleteMut.mutateAsync(id);
      toast.success("Centro de custo removido");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível remover"));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">Centros de custo</h3>
          <p className="text-xs text-muted-foreground">Departamentos usados para apropriar lançamentos.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Novo centro
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-28">Código</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {centros.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-mono text-xs">{c.codigo}</TableCell>
              <TableCell className="font-medium">{c.nome}</TableCell>
              <TableCell className="text-right">
                <Button size="icon" variant="ghost" onClick={() => remover(c.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {!isLoading && centros.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                Nenhum centro de custo cadastrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo centro de custo</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Código *</Label>
              <Input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="Ex.: CC-01" />
            </div>
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: Administrativo" />
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
