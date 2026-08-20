import { CheckCircle2, Plus, RotateCcw, X } from "lucide-react";
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
import { Select } from "@/components/ui/select";
import { apiErrorMessage } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";

import { useCentrosCusto, useCreateLancamento, useEstornarLancamento, useLancamentos, usePlanoContas } from "./api";
import type { PartidaInput, TipoPartida } from "./types";

interface LinhaForm {
  conta_id: string;
  centro_custo_id: string;
  tipo: TipoPartida;
  valor: string;
}

const LINHA_VAZIA = (tipo: TipoPartida): LinhaForm => ({ conta_id: "", centro_custo_id: "", tipo, valor: "" });

export function SecaoLancamentos() {
  const { data: lancamentos = [], isLoading } = useLancamentos();
  const { data: contas = [] } = usePlanoContas();
  const { data: centros = [] } = useCentrosCusto();
  const createMut = useCreateLancamento();
  const estornarMut = useEstornarLancamento();

  const contasLancaveis = contas.filter((c) => c.aceita_lancamento);

  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [historico, setHistorico] = React.useState("");
  const [linhas, setLinhas] = React.useState<LinhaForm[]>([LINHA_VAZIA("debito"), LINHA_VAZIA("credito")]);

  const totalDebito = linhas.filter((l) => l.tipo === "debito").reduce((a, l) => a + (Number(l.valor) || 0), 0);
  const totalCredito = linhas.filter((l) => l.tipo === "credito").reduce((a, l) => a + (Number(l.valor) || 0), 0);
  const diferenca = totalDebito - totalCredito;
  const fecha = diferenca === 0 && totalDebito > 0;

  function addLinha(tipo: TipoPartida) {
    setLinhas((prev) => [...prev, LINHA_VAZIA(tipo)]);
  }

  function updateLinha(index: number, patch: Partial<LinhaForm>) {
    setLinhas((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function removeLinha(index: number) {
    setLinhas((prev) => prev.filter((_, i) => i !== index));
  }

  function resetForm() {
    setData(new Date().toISOString().slice(0, 10));
    setHistorico("");
    setLinhas([LINHA_VAZIA("debito"), LINHA_VAZIA("credito")]);
  }

  async function salvar() {
    if (!historico.trim()) {
      toast.error("Informe o histórico do lançamento");
      return;
    }
    if (!fecha) {
      toast.error("O lançamento precisa fechar: débitos = créditos");
      return;
    }
    const partidas: PartidaInput[] = linhas
      .filter((l) => l.conta_id && Number(l.valor) > 0)
      .map((l) => ({
        conta_id: Number(l.conta_id),
        centro_custo_id: l.centro_custo_id ? Number(l.centro_custo_id) : null,
        tipo: l.tipo,
        valor: Number(l.valor),
      }));
    if (partidas.length < 2) {
      toast.error("Informe ao menos uma partida de débito e uma de crédito");
      return;
    }
    try {
      await createMut.mutateAsync({ data, historico: historico.trim(), partidas });
      toast.success("Lançamento registrado");
      resetForm();
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível registrar o lançamento"));
    }
  }

  async function estornar(id: number) {
    try {
      await estornarMut.mutateAsync(id);
      toast.success("Lançamento estornado");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível estornar"));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">Lançamentos (diário)</h3>
          <p className="text-xs text-muted-foreground">Partida dobrada: todo lançamento precisa fechar (débito = crédito).</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Novo lançamento
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando lançamentos...</p>}
      {!isLoading && lancamentos.length === 0 && (
        <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
          Nenhum lançamento registrado ainda.
        </p>
      )}

      <div className="space-y-3">
        {lancamentos.map((l) => (
          <Card key={l.id} className={cn(l.status === "estornado" && "opacity-60")}>
            <CardContent className="p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{l.numero}</span>
                  <span className="text-sm font-medium">{l.historico}</span>
                  {l.status === "estornado" && <Badge variant="destructive">Estornado</Badge>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(`${l.data}T00:00:00`).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="tnum text-sm font-semibold">{formatCurrency(l.valor_total)}</span>
                  {l.status === "lancado" && (
                    <Button size="sm" variant="outline" onClick={() => estornar(l.id)}>
                      <RotateCcw className="h-3.5 w-3.5" /> Estornar
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/30 p-3">
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Débito</p>
                  {l.partidas
                    .filter((p) => p.tipo === "debito")
                    .map((p) => (
                      <div key={p.id} className="flex justify-between border-b py-1 text-sm last:border-0">
                        <span>
                          <span className="font-mono text-xs text-muted-foreground">{p.conta.codigo}</span> {p.conta.nome}
                        </span>
                        <span className="tnum">{formatCurrency(p.valor)}</span>
                      </div>
                    ))}
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Crédito</p>
                  {l.partidas
                    .filter((p) => p.tipo === "credito")
                    .map((p) => (
                      <div key={p.id} className="flex justify-between border-b py-1 text-sm last:border-0">
                        <span>
                          <span className="font-mono text-xs text-muted-foreground">{p.conta.codigo}</span> {p.conta.nome}
                        </span>
                        <span className="tnum">{formatCurrency(p.valor)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo lançamento contábil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Data *</Label>
                <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Histórico *</Label>
                <Input value={historico} onChange={(e) => setHistorico(e.target.value)} placeholder="Ex.: Venda à vista" />
              </div>
            </div>

            <div className="space-y-2">
              {linhas.map((linha, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Select
                    value={linha.tipo}
                    onChange={(e) => updateLinha(i, { tipo: e.target.value as TipoPartida })}
                    className="w-28 shrink-0"
                  >
                    <option value="debito">Débito</option>
                    <option value="credito">Crédito</option>
                  </Select>
                  <Select
                    value={linha.conta_id}
                    onChange={(e) => updateLinha(i, { conta_id: e.target.value })}
                    className="flex-1"
                  >
                    <option value="">Conta...</option>
                    {contasLancaveis.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.codigo} — {c.nome}
                      </option>
                    ))}
                  </Select>
                  <Select
                    value={linha.centro_custo_id}
                    onChange={(e) => updateLinha(i, { centro_custo_id: e.target.value })}
                    className="w-40 shrink-0"
                  >
                    <option value="">Centro de custo</option>
                    {centros.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.codigo}
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    value={linha.valor}
                    onChange={(e) => updateLinha(i, { valor: e.target.value })}
                    placeholder="0,00"
                    className="w-28 shrink-0"
                  />
                  <Button size="icon" variant="ghost" onClick={() => removeLinha(i)} disabled={linhas.length <= 2}>
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => addLinha("debito")}>
                  <Plus className="h-3.5 w-3.5" /> Débito
                </Button>
                <Button size="sm" variant="outline" onClick={() => addLinha("credito")}>
                  <Plus className="h-3.5 w-3.5" /> Crédito
                </Button>
              </div>
            </div>

            <div
              className={cn(
                "flex items-center justify-between rounded-lg border p-3 text-sm",
                fecha ? "border-success/40 bg-success/10 text-success" : "border-destructive/40 bg-destructive/10 text-destructive",
              )}
            >
              <span className="flex items-center gap-2 font-medium">
                {fecha ? <CheckCircle2 className="h-4 w-4" /> : null}
                {fecha ? "Lançamento fechado" : `Diferença: ${formatCurrency(Math.abs(diferenca))}`}
              </span>
              <span className="tnum">
                D: {formatCurrency(totalDebito)} · C: {formatCurrency(totalCredito)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={salvar} disabled={createMut.isPending || !fecha}>
              Registrar lançamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
