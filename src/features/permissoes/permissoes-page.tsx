import { ShieldCheck } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiErrorMessage } from "@/lib/api";

import { useRoles, useUpdateRole } from "./api";

const MODULOS = ["Clientes", "Produtos", "Estoque", "Vendas", "Compras", "Financeiro", "Fiscal", "Relatorios", "Usuarios"];
const ACOES = ["Ver", "Criar", "Editar", "Excluir"];

export function PermissoesPage() {
  const { data: roles = [] } = useRoles();
  const updateMut = useUpdateRole();
  const [perfil, setPerfil] = React.useState<string | null>(null);
  const [matriz, setMatriz] = React.useState<Record<string, string[]>>({});

  React.useEffect(() => {
    if (roles.length > 0 && perfil === null) {
      setPerfil(roles[0].nome);
      setMatriz(roles[0].permissoes);
    }
  }, [roles, perfil]);

  function changePerfil(nome: string) {
    setPerfil(nome);
    setMatriz(roles.find((r) => r.nome === nome)?.permissoes ?? {});
  }

  function toggle(mod: string, acao: string) {
    setMatriz((prev) => {
      const atual = prev[mod] ?? [];
      const tem = atual.includes(acao);
      return { ...prev, [mod]: tem ? atual.filter((a) => a !== acao) : [...atual, acao] };
    });
  }

  async function salvar() {
    if (!perfil) return;
    try {
      await updateMut.mutateAsync({ nome: perfil, permissoes: matriz });
      toast.success(`Permissões do perfil ${perfil} salvas`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Nao foi possivel salvar"));
    }
  }

  const total = MODULOS.length * ACOES.length;
  const ativas = Object.values(matriz).reduce((a, row) => a + row.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        path="/permissoes"
        actions={<Button onClick={salvar} disabled={updateMut.isPending || !perfil}>Salvar alterações</Button>}
      />

      <Card>
        <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Matriz de permissões (RBAC)</CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{ativas}/{total} permissões</span>
            <Select value={perfil ?? ""} onChange={(e) => changePerfil(e.target.value)} className="w-48">
              {roles.map((r) => <option key={r.nome} value={r.nome}>{r.nome}</option>)}
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Módulo</th>
                  {ACOES.map((a) => <th key={a} className="px-4 py-3 text-center font-medium text-muted-foreground">{a}</th>)}
                </tr>
              </thead>
              <tbody>
                {MODULOS.map((mod) => (
                  <tr key={mod} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{mod}</td>
                    {ACOES.map((acao) => (
                      <td key={acao} className="px-4 py-3">
                        <div className="flex justify-center">
                          <Switch checked={(matriz[mod] ?? []).includes(acao)} onCheckedChange={() => toggle(mod, acao)} aria-label={`${acao} ${mod}`} />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
