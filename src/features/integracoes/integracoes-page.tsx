import {
  Banknote,
  MessageCircle,
  Puzzle,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, StatCard } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { apiErrorMessage } from "@/lib/api";

import { useIntegracoes, useToggleIntegracao } from "./api";

const VISUAL: Record<string, { icon: LucideIcon; cor: string }> = {
  ml: { icon: Store, cor: "#f59e0b" },
  shopee: { icon: ShoppingBag, cor: "#ef4444" },
  wa: { icon: MessageCircle, cor: "#22c55e" },
  banco: { icon: Banknote, cor: "#2563eb" },
  correios: { icon: Truck, cor: "#7c3aed" },
  pix: { icon: Puzzle, cor: "#0891b2" },
};

export function IntegracoesPage() {
  const { data: items = [] } = useIntegracoes();
  const toggleMut = useToggleIntegracao();

  async function toggle(codigo: string, nome: string, conectado: boolean) {
    try {
      await toggleMut.mutateAsync(codigo);
      toast.success(`${nome} ${conectado ? "desconectado" : "conectado"}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Nao foi possivel atualizar"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader path="/integracoes" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Integrações ativas" value={items.filter((i) => i.conectado).length} icon={Puzzle} tone="success" />
        <StatCard label="Disponíveis" value={items.length} icon={Puzzle} />
        <StatCard label="Categorias" value={new Set(items.map((i) => i.categoria)).size} icon={Puzzle} tone="warning" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => {
          const visual = VISUAL[i.codigo] ?? { icon: Puzzle, cor: "#64748b" };
          const Icon = visual.icon;
          return (
            <div key={i.codigo} className="flex flex-col rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ backgroundColor: visual.cor }}>
                  <Icon className="h-5 w-5" />
                </div>
                {i.conectado ? <Badge variant="success">Conectado</Badge> : <Badge variant="secondary">Desconectado</Badge>}
              </div>
              <p className="mt-3 font-semibold">{i.nome}</p>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{i.descricao}</p>
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <span className="text-xs text-muted-foreground">{i.categoria}</span>
                <Switch checked={i.conectado} onCheckedChange={() => toggle(i.codigo, i.nome, i.conectado)} aria-label={`Conectar ${i.nome}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
