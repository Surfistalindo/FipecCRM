import { Mail, Plus, Search, Shield, ShieldCheck, UserCog, Users as UsersIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader, StatCard } from "@/components/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { useRoles } from "@/features/permissoes/api";
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

import { useCreateUsuario, useUpdateUsuario, useUsuarios } from "./api";

const EMPTY = { name: "", email: "", password: "", role_nome: "" };

export function UsuariosPage() {
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY);

  const { data } = useUsuarios({ size: 100, search: search || undefined });
  const { data: roles = [] } = useRoles();
  const createMut = useCreateUsuario();
  const updateMut = useUpdateUsuario();

  const items = data?.items ?? [];

  async function toggle(id: number, ativo: boolean) {
    try {
      await updateMut.mutateAsync({ id, payload: { is_active: !ativo } });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Nao foi possivel atualizar"));
    }
  }

  async function save() {
    if (!form.name || !form.email || !form.password) {
      toast.error("Preencha nome, e-mail e senha");
      return;
    }
    try {
      await createMut.mutateAsync({ ...form, role_nome: form.role_nome || null });
      toast.success("Usuário criado");
      setForm(EMPTY);
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Nao foi possivel criar"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader path="/usuarios" actions={<Button onClick={() => setOpen(true)}><Plus /> Novo usuário</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Usuários ativos" value={items.filter((u) => u.is_active).length} icon={UsersIcon} tone="success" />
        <StatCard label="Com 2FA" value={items.filter((u) => u.totp_enabled).length} icon={ShieldCheck} tone="warning" />
        <StatCard label="Administradores" value={items.filter((u) => u.is_superuser).length} icon={UserCog} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar usuário..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Nenhum usuário encontrado.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((u) => (
            <div
              key={u.id}
              className={cn(
                "flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
                !u.is_active && "opacity-60",
              )}
            >
              <div className="flex items-center gap-3">
                <Avatar name={u.name} className="h-11 w-11" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{u.name}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Mail className="h-3 w-3 shrink-0" /> {u.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Badge variant={u.is_superuser ? "default" : "secondary"} className="gap-1">
                  {u.is_superuser ? <Shield className="h-3 w-3" /> : <UserCog className="h-3 w-3" />}
                  {u.is_superuser ? "Administrador" : "Operador"}
                </Badge>
                {!u.is_superuser && (
                  <Badge variant={u.role_nome ? "outline" : "destructive"}>
                    {u.role_nome ?? "Sem perfil"}
                  </Badge>
                )}
                {u.totp_enabled && (
                  <Badge variant="success" className="gap-1">
                    <ShieldCheck className="h-3 w-3" /> 2FA
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-xs text-muted-foreground">{u.is_active ? "Acesso liberado" : "Acesso bloqueado"}</span>
                <Switch checked={u.is_active} onCheckedChange={() => toggle(u.id, u.is_active)} aria-label="Ativar usuário" />
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo usuário</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>E-mail *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Senha *</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div className="space-y-1.5">
              <Label>Perfil de acesso</Label>
              <Select value={form.role_nome} onChange={(e) => setForm({ ...form, role_nome: e.target.value })}>
                <option value="">Sem perfil (sem acesso a nenhum modulo)</option>
                {roles.map((r) => (
                  <option key={r.nome} value={r.nome}>{r.nome}</option>
                ))}
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={createMut.isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
