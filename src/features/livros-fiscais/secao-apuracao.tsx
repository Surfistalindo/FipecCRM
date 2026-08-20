import { ArrowDownRight, ArrowUpRight, Scale } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, formatCurrency } from "@/lib/utils";

import { useApuracaoIcms, useApuracaoIpi } from "./api";
import type { ApuracaoImposto, SituacaoApuracao } from "./types";

const SITUACAO_LABEL: Record<SituacaoApuracao, string> = {
  a_recolher: "Imposto a recolher",
  credor: "Saldo credor",
  zerado: "Sem saldo devedor",
};

const SITUACAO_STYLE: Record<SituacaoApuracao, string> = {
  a_recolher: "bg-destructive/10 text-destructive border-destructive/30",
  credor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
  zerado: "bg-muted text-muted-foreground border-border",
};

function mesAtual(): string {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
}

function ApuracaoDocumento({ titulo, dados }: { titulo: string; dados: ApuracaoImposto }) {
  return (
    <div className="mx-auto max-w-xl rounded-lg border-2 border-foreground/15 p-8 text-center">
      <p className="font-serif text-xs uppercase tracking-[0.2em] text-muted-foreground">{titulo}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Período de apuração: {dados.mes_referencia.split("-").reverse().join("/")}
      </p>

      <div className="my-6 grid grid-cols-2 gap-6 border-y py-6">
        <div>
          <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <ArrowUpRight className="h-3.5 w-3.5" /> Débitos (saídas)
          </p>
          <p className="tnum mt-1 text-xl font-semibold">{formatCurrency(dados.total_debitos)}</p>
        </div>
        <div>
          <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <ArrowDownRight className="h-3.5 w-3.5" /> Créditos (entradas)
          </p>
          <p className="tnum mt-1 text-xl font-semibold">{formatCurrency(dados.total_creditos)}</p>
        </div>
      </div>

      <p className="text-xs uppercase tracking-wide text-muted-foreground">Saldo do período</p>
      <p className="tnum mt-1 text-3xl font-bold">{formatCurrency(Math.abs(Number(dados.saldo)))}</p>
      <span
        className={cn(
          "mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
          SITUACAO_STYLE[dados.situacao],
        )}
      >
        <Scale className="h-3.5 w-3.5" />
        {SITUACAO_LABEL[dados.situacao]}
      </span>
    </div>
  );
}

export function SecaoApuracao({ imposto }: { imposto: "icms" | "ipi" }) {
  const [mes, setMes] = React.useState(mesAtual());
  const icms = useApuracaoIcms(imposto === "icms" ? mes : "");
  const ipi = useApuracaoIpi(imposto === "ipi" ? mes : "");
  const { data, isLoading } = imposto === "icms" ? icms : ipi;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg font-semibold tracking-wide">
            Apuração de {imposto === "icms" ? "ICMS" : "IPI"}
          </h2>
          <p className="text-xs text-muted-foreground">
            Confronto entre débitos (saídas) e créditos (entradas) do período.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label>Mês de referência</Label>
          <Input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="w-44" />
        </div>
      </div>

      {isLoading && <p className="text-center text-sm text-muted-foreground">Calculando apuração...</p>}
      {data && <ApuracaoDocumento titulo={`Apuração de ${imposto === "icms" ? "ICMS" : "IPI"}`} dados={data} />}
    </div>
  );
}
