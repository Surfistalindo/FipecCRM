import { Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useAvancarSituacao, useVendas } from "@/features/vendas/api";
import type { SituacaoEntrega } from "@/features/vendas/types";
import { apiErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

const COLUNAS: { key: SituacaoEntrega; label: string; accent: string }[] = [
  { key: "novo", label: "Novo", accent: "border-t-blue-500" },
  { key: "separacao", label: "Em separação", accent: "border-t-amber-500" },
  { key: "faturado", label: "Faturado", accent: "border-t-violet-500" },
  { key: "entregue", label: "Entregue", accent: "border-t-emerald-500" },
];

export function PedidosPage() {
  const { data, isLoading } = useVendas({ status: "finalizada", size: 100 });
  const avancarMut = useAvancarSituacao();

  const items = data?.items ?? [];

  async function avancar(id: number, situacaoAtual: SituacaoEntrega) {
    if (situacaoAtual === "entregue") return;
    try {
      await avancarMut.mutateAsync(id);
      toast.success("Pedido avançou de etapa");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível avançar"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader path="/pedidos" actions={<Button onClick={() => toast.info("Use a tela de Vendas para criar um novo pedido")}><Plus /> Novo pedido</Button>} />

      {isLoading ? (
        <div className="py-16 text-center text-muted-foreground">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUNAS.map((col) => {
            const pedidos = items.filter((p) => p.situacao_entrega === col.key);
            const total = pedidos.reduce((a, p) => a + Number(p.total), 0);
            return (
              <div key={col.key} className={`rounded-xl border border-t-4 bg-muted/30 p-3 ${col.accent}`}>
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className="text-sm font-semibold">{col.label}</span>
                  <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium">{pedidos.length}</span>
                </div>
                <div className="space-y-2">
                  {pedidos.map((p) => (
                    <div
                      key={p.id}
                      className="cursor-pointer rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
                      onClick={() => avancar(p.id, p.situacao_entrega)}
                    >
                      <p className="font-mono text-xs font-semibold">{p.numero}</p>
                      <p className="mt-1 truncate text-sm">{p.cliente?.nome ?? "Consumidor final"}</p>
                      <p className="mt-1 text-sm font-bold">{formatCurrency(p.total)}</p>
                    </div>
                  ))}
                  {pedidos.length === 0 && (
                    <p className="px-1 py-6 text-center text-xs text-muted-foreground">Sem pedidos</p>
                  )}
                </div>
                <div className="mt-3 border-t px-1 pt-2 text-xs text-muted-foreground">Total: {formatCurrency(total)}</div>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-center text-xs text-muted-foreground">Clique em um pedido para avançá-lo de etapa.</p>
    </div>
  );
}
