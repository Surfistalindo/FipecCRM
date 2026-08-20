import { Plus, Star, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

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
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

import {
  useCondicoesPagamento,
  useCreateCondicaoPagamento,
  useDeleteCondicaoPagamento,
  useMarcarCondicaoPagamentoPadrao,
} from "./api";
import type { CondicaoPagamentoInput } from "./types";

const EMPTY: CondicaoPagamentoInput = {
  nome: "",
  parcelas: 1,
  intervalo_dias: 30,
  desconto_a_vista_pct: 0,
  juros_atraso_pct_mes: 0,
  multa_atraso_pct: 0,
};

export function SecaoCondicoesPagamento() {
  const { data: condicoes = [], isLoading } = useCondicoesPagamento();
  const createMut = useCreateCondicaoPagamento();
  const padraoMut = useMarcarCondicaoPagamentoPadrao();
  const deleteMut = useDeleteCondicaoPagamento();

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<CondicaoPagamentoInput>(EMPTY);

  async function salvar() {
    if (!form.nome.trim()) {
      toast.error("Informe o nome da condição");
      return;
    }
    try {
      await createMut.mutateAsync(form);
      toast.success("Condição de pagamento criada");
      setForm(EMPTY);
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível criar a condição"));
    }
  }

  async function marcarPadrao(id: number) {
    try {
      await padraoMut.mutateAsync(id);
      toast.success("Condição definida como padrão");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível definir como padrão"));
    }
  }

  async function remover(id: number) {
    try {
      await deleteMut.mutateAsync(id);
      toast.success("Condição removida");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível remover"));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">Condições de pagamento</h3>
          <p className="text-xs text-muted-foreground">
            Prazos e parcelamento oferecidos em Vendas e Orçamentos.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Nova condição
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {!isLoading && condicoes.length === 0 && (
        <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          Nenhuma condição de pagamento cadastrada.
        </p>
      )}

      <div className="space-y-2">
        {condicoes.map((c) => (
          <Card key={c.id} className={cn(c.padrao && "border-primary")}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{c.nome}</p>
                  {c.padrao && (
                    <Badge variant="default" className="gap-1">
                      <Star className="h-3 w-3 fill-current" /> Padrão
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {c.parcelas}x a cada {c.intervalo_dias} dias
                  {Number(c.desconto_a_vista_pct) > 0 && ` · ${Number(c.desconto_a_vista_pct)}% desconto à vista`}
                  {Number(c.juros_atraso_pct_mes) > 0 && ` · ${Number(c.juros_atraso_pct_mes)}% juros/mês em atraso`}
                  {Number(c.multa_atraso_pct) > 0 && ` · ${Number(c.multa_atraso_pct)}% multa`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!c.padrao && (
                  <Button size="sm" variant="outline" onClick={() => marcarPadrao(c.id)}>
                    Definir padrão
                  </Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => remover(c.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova condição de pagamento</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: 30/60/90" />
            </div>
            <div className="space-y-1.5">
              <Label>Parcelas</Label>
              <Input
                type="number"
                value={form.parcelas}
                onChange={(e) => setForm({ ...form, parcelas: Number(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Intervalo (dias)</Label>
              <Input
                type="number"
                value={form.intervalo_dias}
                onChange={(e) => setForm({ ...form, intervalo_dias: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Desconto à vista (%)</Label>
              <Input
                type="number"
                value={form.desconto_a_vista_pct}
                onChange={(e) => setForm({ ...form, desconto_a_vista_pct: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Juros de atraso (% a.m.)</Label>
              <Input
                type="number"
                value={form.juros_atraso_pct_mes}
                onChange={(e) => setForm({ ...form, juros_atraso_pct_mes: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Multa por atraso (%)</Label>
              <Input
                type="number"
                value={form.multa_atraso_pct}
                onChange={(e) => setForm({ ...form, multa_atraso_pct: Number(e.target.value) || 0 })}
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
