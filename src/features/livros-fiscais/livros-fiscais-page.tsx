import { ArrowDownToLine, ArrowUpFromLine, Calculator, Receipt } from "lucide-react";
import * as React from "react";

import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";

import { SecaoApuracao } from "./secao-apuracao";
import { SecaoRegistros } from "./secao-registros";

type PaginaKey = "entradas" | "saidas" | "icms" | "ipi";

const PAGINAS: { key: PaginaKey; label: string; icon: typeof Receipt }[] = [
  { key: "entradas", label: "Entradas", icon: ArrowDownToLine },
  { key: "saidas", label: "Saídas", icon: ArrowUpFromLine },
  { key: "icms", label: "Apuração ICMS", icon: Calculator },
  { key: "ipi", label: "Apuração IPI", icon: Calculator },
];

export function LivrosFiscaisPage() {
  const [pagina, setPagina] = React.useState<PaginaKey>("entradas");

  return (
    <div className="space-y-6">
      <PageHeader path="/livros-fiscais" />

      <div className="flex items-stretch rounded-xl border bg-card shadow-sm">
        {/* ---- Lombada do livro: abas verticais ---- */}
        <div className="flex w-14 shrink-0 flex-col items-center gap-1 border-r bg-muted/30 py-4">
          {PAGINAS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPagina(p.key)}
              title={p.label}
              className={cn(
                "group relative flex w-full flex-col items-center gap-2 py-4 transition-colors",
                pagina === p.key ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {pagina === p.key && (
                <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary" />
              )}
              <p.icon className="h-4 w-4 shrink-0" />
              <span
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ writingMode: "vertical-rl" }}
              >
                {p.label}
              </span>
            </button>
          ))}
        </div>

        {/* ---- Pagina do livro ---- */}
        <div className="flex-1 p-6">
          {pagina === "entradas" && <SecaoRegistros tipo="entrada" />}
          {pagina === "saidas" && <SecaoRegistros tipo="saida" />}
          {pagina === "icms" && <SecaoApuracao imposto="icms" />}
          {pagina === "ipi" && <SecaoApuracao imposto="ipi" />}
        </div>
      </div>
    </div>
  );
}
