import { Scale } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

import { useBalancete } from "./api";
import type { TipoConta } from "./types";

const TIPO_LABEL: Record<TipoConta, string> = {
  ativo: "Ativo",
  passivo: "Passivo",
  patrimonio_liquido: "Patrimônio Líquido",
  receita: "Receita",
  despesa: "Despesa",
};

const TIPO_VARIANT: Record<TipoConta, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  ativo: "default",
  passivo: "destructive",
  patrimonio_liquido: "secondary",
  receita: "success",
  despesa: "warning",
};

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function SecaoBalancete() {
  const [dataFim, setDataFim] = React.useState(hojeISO());
  const { data: balancete, isLoading } = useBalancete(dataFim);

  const fechado = balancete ? Number(balancete.total_debito) === Number(balancete.total_credito) : false;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">Balancete de verificação</h3>
          <p className="text-xs text-muted-foreground">Posição consolidada de todas as contas até a data de corte.</p>
        </div>
        <div className="space-y-1.5">
          <Label>Posição em</Label>
          <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-44" />
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando balancete...</p>}

      {balancete && (
        <div className="overflow-hidden rounded-lg border-2 border-foreground/15">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-foreground/15 bg-muted/50">
                <th className="px-4 py-3 text-left font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Conta
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tipo
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Débito
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Crédito
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Saldo
                </th>
              </tr>
            </thead>
            <tbody>
              {balancete.linhas.map((linha) => (
                <tr key={linha.conta_id} className="border-b border-foreground/10 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{linha.codigo}</td>
                  <td className="px-4 py-2.5 font-medium">{linha.nome}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant={TIPO_VARIANT[linha.tipo]}>{TIPO_LABEL[linha.tipo]}</Badge>
                  </td>
                  <td className="tnum px-4 py-2.5 text-right">
                    {Number(linha.total_debito) > 0 ? formatCurrency(linha.total_debito) : "—"}
                  </td>
                  <td className="tnum px-4 py-2.5 text-right">
                    {Number(linha.total_credito) > 0 ? formatCurrency(linha.total_credito) : "—"}
                  </td>
                  <td className="tnum px-4 py-2.5 text-right font-semibold">{formatCurrency(linha.saldo)}</td>
                </tr>
              ))}
              {balancete.linhas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Nenhuma movimentação registrada até esta data.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-foreground/15 bg-muted/50">
                <td colSpan={3} className="px-4 py-3 text-sm font-bold">
                  Totais
                </td>
                <td className="tnum px-4 py-3 text-right text-sm font-bold">{formatCurrency(balancete.total_debito)}</td>
                <td className="tnum px-4 py-3 text-right text-sm font-bold">{formatCurrency(balancete.total_credito)}</td>
                <td className="px-4 py-3 text-right">
                  <Badge variant={fechado ? "success" : "destructive"}>{fechado ? "Fechado" : "Não fecha"}</Badge>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {balancete && balancete.linhas.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
          <Scale className="h-8 w-8 opacity-20" />
        </div>
      )}
    </div>
  );
}
