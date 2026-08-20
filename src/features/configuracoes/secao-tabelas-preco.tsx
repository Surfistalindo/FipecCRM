import { ArrowDownCircle, ArrowUpCircle, Plus, Star, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

import {
  useCreateTabelaPreco,
  useDeleteTabelaPreco,
  useMarcarTabelaPrecoPadrao,
  useTabelasPreco,
} from "./api";
import type { TabelaPrecoInput, TipoAjusteTabelaPreco } from "./types";

const EMPTY: TabelaPrecoInput = { nome: "", tipo_ajuste: "desconto", percentual: 0 };

export function SecaoTabelasPreco() {
  const { data: tabelas = [], isLoading } = useTabelasPreco();
  const createMut = useCreateTabelaPreco();
  const padraoMut = useMarcarTabelaPrecoPadrao();
  const deleteMut = useDeleteTabelaPreco();

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<TabelaPrecoInput>(EMPTY);

  async function salvar() {
    if (!form.nome.trim()) {
      toast.error("Informe o nome da tabela");
      return;
    }
    try {
      await createMut.mutateAsync(form);
      toast.success("Tabela de preço criada");
      setForm(EMPTY);
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível criar a tabela"));
    }
  }

  async function marcarPadrao(id: number) {
    try {
      await padraoMut.mutateAsync(id);
      toast.success("Tabela definida como padrão");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível definir como padrão"));
    }
  }

  async function remover(id: number) {
    try {
      await deleteMut.mutateAsync(id);
      toast.success("Tabela removida");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível remover"));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">Tabelas de preço</h3>
          <p className="text-xs text-muted-foreground">
            Ajuste percentual sobre o preço de venda do produto (atacado, varejo, promocional).
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Nova tabela
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Ajuste</TableHead>
            <TableHead className="text-right">Percentual</TableHead>
            <TableHead />
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tabelas.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium">{t.nome}</TableCell>
              <TableCell>
                {t.tipo_ajuste === "desconto" ? (
                  <Badge variant="success" className="gap-1">
                    <ArrowDownCircle className="h-3 w-3" /> Desconto
                  </Badge>
                ) : (
                  <Badge variant="warning" className="gap-1">
                    <ArrowUpCircle className="h-3 w-3" /> Acréscimo
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right text-sm font-medium tnum">{Number(t.percentual)}%</TableCell>
              <TableCell>
                {t.padrao ? (
                  <Badge variant="default" className="gap-1">
                    <Star className="h-3 w-3 fill-current" /> Padrão
                  </Badge>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => marcarPadrao(t.id)}>
                    Definir padrão
                  </Button>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button size="icon" variant="ghost" onClick={() => remover(t.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {!isLoading && tabelas.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma tabela de preço cadastrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova tabela de preço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: Atacado" />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de ajuste</Label>
              <Select
                value={form.tipo_ajuste}
                onChange={(e) => setForm({ ...form, tipo_ajuste: e.target.value as TipoAjusteTabelaPreco })}
              >
                <option value="desconto">Desconto sobre o preço de venda</option>
                <option value="acrescimo">Acréscimo sobre o preço de venda</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Percentual (%)</Label>
              <Input
                type="number"
                value={form.percentual}
                onChange={(e) => setForm({ ...form, percentual: Number(e.target.value) || 0 })}
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
