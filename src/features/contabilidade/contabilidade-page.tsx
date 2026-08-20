import { BookOpen, Building2, Landmark, Scale, ScrollText, Wallet } from "lucide-react";
import * as React from "react";

import { PageHeader, StatCard } from "@/components/page-header";
import { cn } from "@/lib/utils";

import { usePlanoContas } from "./api";
import { SecaoBalancete } from "./secao-balancete";
import { SecaoCentrosCusto } from "./secao-centros-custo";
import { SecaoLancamentos } from "./secao-lancamentos";
import { SecaoPlanoContas } from "./secao-plano-contas";
import { SecaoRazao } from "./secao-razao";

type SecaoKey = "plano-contas" | "centros-custo" | "lancamentos" | "razao" | "balancete";

const SECOES: { key: SecaoKey; label: string; icon: typeof BookOpen }[] = [
  { key: "plano-contas", label: "Plano de contas", icon: Landmark },
  { key: "centros-custo", label: "Centros de custo", icon: Building2 },
  { key: "lancamentos", label: "Lançamentos", icon: ScrollText },
  { key: "razao", label: "Razão", icon: BookOpen },
  { key: "balancete", label: "Balancete", icon: Scale },
];

export function ContabilidadePage() {
  const [secao, setSecao] = React.useState<SecaoKey>("plano-contas");
  const { data: contas = [] } = usePlanoContas();

  const contasAnaliticas = contas.filter((c) => c.aceita_lancamento).length;
  const totalAtivo = contas
    .filter((c) => c.aceita_lancamento && c.tipo === "ativo")
    .reduce((a, c) => a + Number(c.saldo_atual), 0);

  return (
    <div className="space-y-6">
      <PageHeader path="/contabilidade" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Contas cadastradas" value={contas.length} icon={Landmark} />
        <StatCard label="Contas analíticas" value={contasAnaliticas} icon={ScrollText} />
        <StatCard label="Saldo total do Ativo" value={totalAtivo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} icon={Wallet} tone="success" />
      </div>

      <div className="rounded-xl border">
        <div className="flex overflow-x-auto border-b">
          {SECOES.map((s) => (
            <button
              key={s.key}
              onClick={() => setSecao(s.key)}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors",
                secao === s.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {secao === "plano-contas" && <SecaoPlanoContas />}
          {secao === "centros-custo" && <SecaoCentrosCusto />}
          {secao === "lancamentos" && <SecaoLancamentos />}
          {secao === "razao" && <SecaoRazao />}
          {secao === "balancete" && <SecaoBalancete />}
        </div>
      </div>
    </div>
  );
}
