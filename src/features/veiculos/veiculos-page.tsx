import { Car, Plus, Search, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader, StatCard } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useClientes } from "@/features/clientes/api";
import { apiErrorMessage } from "@/lib/api";

import { useCreateVeiculo, useDeleteVeiculo, useVeiculos } from "./api";

const EMPTY = {
  cliente_id: "",
  placa: "",
  marca: "",
  modelo: "",
  ano: "",
  km_atual: "",
};

export function VeiculosPage() {
  const { data: veiculos = [], isLoading } = useVeiculos();
  const { data: clientesPage } = useClientes({ page: 1, size: 200 });
  const createMut = useCreateVeiculo();
  const deleteMut = useDeleteVeiculo();

  const clientes = clientesPage?.items ?? [];

  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY);

  const filtered = veiculos.filter((v) => {
    const termo = search.toLowerCase();
    return (
      (v.placa ?? "").toLowerCase().includes(termo) ||
      (v.modelo ?? "").toLowerCase().includes(termo) ||
      v.cliente.nome.toLowerCase().includes(termo)
    );
  });

  async function salvar() {
    if (!form.cliente_id) {
      toast.error("Selecione o cliente");
      return;
    }
    const descricao = [form.marca, form.modelo].filter(Boolean).join(" ") || form.placa || "Veículo";
    try {
      await createMut.mutateAsync({
        cliente_id: Number(form.cliente_id),
        descricao,
        marca: form.marca || null,
        modelo: form.modelo || null,
        ano: form.ano || null,
        placa: form.placa || null,
        km_atual: form.km_atual ? Number(form.km_atual) : null,
      });
      toast.success("Veículo cadastrado");
      setForm(EMPTY);
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível cadastrar o veículo"));
    }
  }

  async function remover(id: number) {
    try {
      await deleteMut.mutateAsync(id);
      toast.success("Veículo removido");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível remover o veículo"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        path="/veiculos"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus /> Novo veículo
          </Button>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Veículos cadastrados" value={veiculos.length} icon={Car} />
        <StatCard
          label="Marcas distintas"
          value={new Set(veiculos.map((v) => v.marca).filter(Boolean)).size}
          icon={Car}
          tone="warning"
        />
        <StatCard
          label="Clientes com veículo"
          value={new Set(veiculos.map((v) => v.cliente_id)).size}
          icon={Car}
          tone="success"
        />
      </div>
      <Card>
        <div className="border-b p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por placa, modelo ou cliente..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placa</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead className="hidden md:table-cell">Ano</TableHead>
              <TableHead className="hidden lg:table-cell">Cliente</TableHead>
              <TableHead className="text-right">KM</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  {v.placa ? (
                    <Badge variant="outline" className="font-mono">
                      {v.placa}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{[v.marca, v.modelo].filter(Boolean).join(" ") || v.descricao}</div>
                </TableCell>
                <TableCell className="hidden text-sm md:table-cell">{v.ano ?? "—"}</TableCell>
                <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                  {v.cliente.nome}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {v.km_atual != null ? `${v.km_atual.toLocaleString("pt-BR")} km` : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => remover(v.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum veículo cadastrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo veículo</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Cliente *</Label>
              <Select value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}>
                <option value="">Selecione...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Placa</Label>
              <Input
                value={form.placa}
                onChange={(e) => setForm({ ...form, placa: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ano</Label>
              <Input value={form.ano} onChange={(e) => setForm({ ...form, ano: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Marca</Label>
              <Input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Modelo</Label>
              <Input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>KM atual</Label>
              <Input
                type="number"
                value={form.km_atual}
                onChange={(e) => setForm({ ...form, km_atual: e.target.value })}
              />
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
