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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiErrorMessage } from "@/lib/api";
import { formatCurrency, formatDocumento } from "@/lib/utils";

import { useCreateRegistroFiscal, useDeleteRegistroFiscal, useRegistrosFiscais } from "./api";
import type { RegistroFiscalInput, TipoRegistroFiscal } from "./types";

const EMPTY = (tipo: TipoRegistroFiscal): RegistroFiscalInput => ({
  tipo,
  data: new Date().toISOString().slice(0, 10),
  numero_nf: "",
  serie: "",
  cfop: "",
  participante_nome: "",
  participante_documento: "",
  valor_produtos: 0,
  base_calculo_icms: 0,
  aliquota_icms: 0,
  valor_icms: 0,
  base_calculo_ipi: 0,
  aliquota_ipi: 0,
  valor_ipi: 0,
  valor_total: 0,
  observacao: "",
});

export function SecaoRegistros({ tipo }: { tipo: TipoRegistroFiscal }) {
  const { data: registros = [], isLoading } = useRegistrosFiscais(tipo);
  const createMut = useCreateRegistroFiscal();
  const deleteMut = useDeleteRegistroFiscal();

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<RegistroFiscalInput>(EMPTY(tipo));

  const totalProdutos = registros.reduce((a, r) => a + Number(r.valor_produtos), 0);
  const totalIcms = registros.reduce((a, r) => a + Number(r.valor_icms), 0);
  const totalIpi = registros.reduce((a, r) => a + Number(r.valor_ipi), 0);

  function abrirNovo() {
    setForm(EMPTY(tipo));
    setOpen(true);
  }

  async function salvar() {
    if (!form.numero_nf.trim() || !form.cfop.trim() || !form.participante_nome.trim()) {
      toast.error("Preencha número da NF, CFOP e participante");
      return;
    }
    try {
      await createMut.mutateAsync({
        ...form,
        valor_total: form.valor_total || form.valor_produtos,
      });
      toast.success("Registro lançado no livro");
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível lançar o registro"));
    }
  }

  async function remover(id: number) {
    try {
      await deleteMut.mutateAsync(id);
      toast.success("Registro removido");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível remover"));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg font-semibold tracking-wide">
            {tipo === "entrada" ? "Livro de Registro de Entradas" : "Livro de Registro de Saídas"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {tipo === "entrada" ? "Notas fiscais recebidas de fornecedores." : "Notas fiscais emitidas para clientes."}
          </p>
        </div>
        <Button size="sm" onClick={abrirNovo}>
          <Plus className="h-3.5 w-3.5" /> Lançar nota
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Total de produtos</p>
          <p className="tnum text-lg font-semibold">{formatCurrency(totalProdutos)}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Total ICMS</p>
          <p className="tnum text-lg font-semibold">{formatCurrency(totalIcms)}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Total IPI</p>
          <p className="tnum text-lg font-semibold">{formatCurrency(totalIpi)}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>NF</TableHead>
              <TableHead>CFOP</TableHead>
              <TableHead>Participante</TableHead>
              <TableHead className="text-right">Produtos</TableHead>
              <TableHead className="text-right">ICMS</TableHead>
              <TableHead className="text-right">IPI</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {registros.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-xs">{new Date(`${r.data}T00:00:00`).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="font-mono text-xs">
                  {r.numero_nf}
                  {r.serie ? `/${r.serie}` : ""}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{r.cfop}</TableCell>
                <TableCell>
                  <p className="text-sm font-medium">{r.participante_nome}</p>
                  {r.participante_documento && (
                    <p className="text-xs text-muted-foreground">{formatDocumento(r.participante_documento)}</p>
                  )}
                </TableCell>
                <TableCell className="tnum text-right text-sm">{formatCurrency(r.valor_produtos)}</TableCell>
                <TableCell className="tnum text-right text-sm">{formatCurrency(r.valor_icms)}</TableCell>
                <TableCell className="tnum text-right text-sm">
                  {Number(r.valor_ipi) > 0 ? formatCurrency(r.valor_ipi) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => remover(r.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && registros.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma nota lançada neste livro ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Lançar {tipo === "entrada" ? "nota de entrada" : "nota de saída"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Data *</Label>
              <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Número NF *</Label>
              <Input value={form.numero_nf} onChange={(e) => setForm({ ...form, numero_nf: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Série</Label>
              <Input value={form.serie ?? ""} onChange={(e) => setForm({ ...form, serie: e.target.value })} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>{tipo === "entrada" ? "Fornecedor" : "Cliente"} *</Label>
              <Input
                value={form.participante_nome}
                onChange={(e) => setForm({ ...form, participante_nome: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>CFOP *</Label>
              <Input
                value={form.cfop}
                onChange={(e) => setForm({ ...form, cfop: e.target.value })}
                placeholder={tipo === "entrada" ? "1102" : "5102"}
                maxLength={4}
              />
            </div>
            <div className="space-y-1.5">
              <Label>CPF/CNPJ</Label>
              <Input
                value={form.participante_documento ?? ""}
                onChange={(e) => setForm({ ...form, participante_documento: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Valor dos produtos *</Label>
              <Input
                type="number"
                value={form.valor_produtos}
                onChange={(e) =>
                  setForm({ ...form, valor_produtos: Number(e.target.value) || 0, valor_total: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Base cálc. ICMS</Label>
              <Input
                type="number"
                value={form.base_calculo_icms}
                onChange={(e) => setForm({ ...form, base_calculo_icms: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Alíquota ICMS (%)</Label>
              <Input
                type="number"
                value={form.aliquota_icms}
                onChange={(e) => setForm({ ...form, aliquota_icms: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Valor ICMS</Label>
              <Input
                type="number"
                value={form.valor_icms}
                onChange={(e) => setForm({ ...form, valor_icms: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Base cálc. IPI</Label>
              <Input
                type="number"
                value={form.base_calculo_ipi}
                onChange={(e) => setForm({ ...form, base_calculo_ipi: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Alíquota IPI (%)</Label>
              <Input
                type="number"
                value={form.aliquota_ipi}
                onChange={(e) => setForm({ ...form, aliquota_ipi: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Valor IPI</Label>
              <Input
                type="number"
                value={form.valor_ipi}
                onChange={(e) => setForm({ ...form, valor_ipi: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="col-span-3 space-y-1.5">
              <Label>Observação</Label>
              <Textarea value={form.observacao ?? ""} onChange={(e) => setForm({ ...form, observacao: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={salvar} disabled={createMut.isPending}>
              Lançar no livro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
