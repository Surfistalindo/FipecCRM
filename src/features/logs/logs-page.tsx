import { Activity, LogIn, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import * as React from "react";

import { PageHeader } from "@/components/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDateTime } from "@/lib/format";

import { useLogs } from "./api";
import type { AcaoLog } from "./types";

const ACAO_META: Record<AcaoLog, { label: string; variant: "default" | "success" | "secondary" | "destructive"; icon: LucideIcon }> = {
  login: { label: "Login", variant: "secondary", icon: LogIn },
  criar: { label: "Criação", variant: "success", icon: Plus },
  editar: { label: "Edição", variant: "default", icon: Pencil },
  excluir: { label: "Exclusão", variant: "destructive", icon: Trash2 },
};

export function LogsPage() {
  const [search, setSearch] = React.useState("");
  const [filtro, setFiltro] = React.useState<"todas" | AcaoLog>("todas");

  const { data = [] } = useLogs();

  const filtered = data.filter(
    (l) =>
      (filtro === "todas" || l.acao === filtro) &&
      (l.descricao.toLowerCase().includes(search.toLowerCase()) || l.usuario_nome.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <PageHeader path="/logs" actions={<Badge variant="secondary"><Activity className="mr-1 h-3 w-3" /> LGPD · auditoria</Badge>} />

      <Card>
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por descrição ou usuário..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={filtro} onChange={(e) => setFiltro(e.target.value as typeof filtro)} className="sm:w-44">
            <option value="todas">Todas as ações</option>
            <option value="login">Login</option>
            <option value="criar">Criação</option>
            <option value="editar">Edição</option>
            <option value="excluir">Exclusão</option>
          </Select>
        </div>

        <div className="divide-y">
          {filtered.map((l) => {
            const meta = ACAO_META[l.acao];
            const Icon = meta.icon;
            return (
              <div key={l.id} className="flex items-center gap-4 p-4">
                <Avatar name={l.usuario_nome} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{l.usuario_nome}</span>
                    <Badge variant={meta.variant}><Icon className="mr-1 h-3 w-3" />{meta.label}</Badge>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{l.descricao}</p>
                </div>
                <div className="hidden text-right text-xs text-muted-foreground sm:block">
                  <p>{formatDateTime(l.created_at)}</p>
                  {l.ip && <p className="font-mono">{l.ip}</p>}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">Nenhum log encontrado.</p>}
        </div>
      </Card>
    </div>
  );
}
