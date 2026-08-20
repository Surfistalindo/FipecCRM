import { BookOpen } from "lucide-react";
import * as React from "react";

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
import { formatCurrency } from "@/lib/utils";

import { usePlanoContas, useRazao } from "./api";

function primeiroDiaDoMes(): string {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10);
}

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function SecaoRazao() {
  const { data: contas = [] } = usePlanoContas();
  const contasLancaveis = contas.filter((c) => c.aceita_lancamento);

  const [contaId, setContaId] = React.useState<string>("");
  const [dataInicio, setDataInicio] = React.useState(primeiroDiaDoMes());
  const [dataFim, setDataFim] = React.useState(hojeISO());

  const { data: razao, isLoading } = useRazao(contaId ? Number(contaId) : null, dataInicio, dataFim);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Razão</h3>
        <p className="text-xs text-muted-foreground">Extrato de movimentações de uma conta, com saldo acumulado.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-1">
          <Label>Conta</Label>
          <Select value={contaId} onChange={(e) => setContaId(e.target.value)}>
            <option value="">Selecione uma conta...</option>
            {contasLancaveis.map((c) => (
              <option key={c.id} value={c.id}>
                {c.codigo} — {c.nome}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>De</Label>
          <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Até</Label>
          <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </div>
      </div>

      {!contaId && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-muted-foreground">
          <BookOpen className="h-8 w-8 opacity-30" />
          <p className="text-sm">Selecione uma conta para ver o razão</p>
        </div>
      )}

      {contaId && isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      {contaId && razao && (
        <div className="overflow-hidden rounded-lg border font-mono">
          <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2 font-sans">
            <div>
              <p className="text-sm font-semibold">
                {razao.conta.codigo} — {razao.conta.nome}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Saldo anterior: <span className="tnum font-medium text-foreground">{formatCurrency(razao.saldo_anterior)}</span>
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-sans">Data</TableHead>
                <TableHead className="font-sans">Lançamento</TableHead>
                <TableHead className="font-sans">Histórico</TableHead>
                <TableHead className="text-right font-sans">Débito</TableHead>
                <TableHead className="text-right font-sans">Crédito</TableHead>
                <TableHead className="text-right font-sans">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {razao.linhas.map((linha, i) => (
                <TableRow key={i}>
                  <TableCell className="text-xs">{new Date(`${linha.data}T00:00:00`).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{linha.lancamento_numero}</TableCell>
                  <TableCell className="font-sans text-sm">{linha.historico}</TableCell>
                  <TableCell className="tnum text-right text-sm">
                    {Number(linha.debito) > 0 ? formatCurrency(linha.debito) : "—"}
                  </TableCell>
                  <TableCell className="tnum text-right text-sm">
                    {Number(linha.credito) > 0 ? formatCurrency(linha.credito) : "—"}
                  </TableCell>
                  <TableCell className="tnum text-right text-sm font-semibold">
                    {formatCurrency(linha.saldo_acumulado)}
                  </TableCell>
                </TableRow>
              ))}
              {razao.linhas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center font-sans text-sm text-muted-foreground">
                    Nenhuma movimentação no período.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-2 font-sans">
            <span className="text-sm font-semibold">Saldo final</span>
            <span className="tnum text-sm font-bold">{formatCurrency(razao.saldo_final)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
