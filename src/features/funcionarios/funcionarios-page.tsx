import { Briefcase, Contact, Phone, Plane, Plus, Search, Trash2, Wallet } from "lucide-react";
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
import { apiErrorMessage } from "@/lib/api";
import { cn, formatCurrency, formatDocumento } from "@/lib/utils";

import { useCreateFuncionario, useDeleteFuncionario, useFuncionarios } from "./api";
import type { Funcionario, SituacaoFuncionario } from "./types";

const SITUACAO_VARIANT: Record<SituacaoFuncionario, "success" | "warning" | "secondary" | "destructive"> = {
  Ativo: "success",
  Férias: "warning",
  Afastado: "secondary",
  Desligado: "destructive",
};

const EMPTY = { nome: "", cargo: "", departamento: "", cpf: "", telefone: "", admissao: "", salario: "" };

export function FuncionariosPage() {
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [dep, setDep] = React.useState("Todos");
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError } = useFuncionarios({
    size: 100,
    search: debounced || undefined,
    departamento: dep === "Todos" ? undefined : dep,
  });
  const createMut = useCreateFuncionario();
  const deleteMut = useDeleteFuncionario();

  const items = data?.items ?? [];
  const departamentos = ["Todos", ...Array.from(new Set(items.map((f) => f.departamento).filter(Boolean)))] as string[];

  const ativos = items.filter((f) => f.situacao === "Ativo").length;
  const emFerias = items.filter((f) => f.situacao === "Férias").length;
  const folha = items.filter((f) => f.situacao !== "Desligado").reduce((a, f) => a + Number(f.salario), 0);

  async function save() {
    if (!form.nome) return toast.error("Informe o nome do funcionário");
    try {
      await createMut.mutateAsync({
        nome: form.nome,
        cargo: form.cargo || null,
        departamento: form.departamento || "Administrativo",
        cpf: form.cpf || null,
        telefone: form.telefone || null,
        admissao: form.admissao || null,
        salario: form.salario || "0",
      });
      toast.success("Funcionário cadastrado");
      setForm(EMPTY);
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível salvar"));
    }
  }

  async function handleDelete(f: Funcionario) {
    if (!confirm(`Excluir o funcionário "${f.nome}"?`)) return;
    try {
      await deleteMut.mutateAsync(f.id);
      toast.success("Funcionário excluído");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível excluir"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        path="/funcionarios"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus /> Novo funcionário
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Funcionários ativos" value={ativos} icon={Contact} />
        <StatCard label="Folha mensal" value={formatCurrency(folha)} icon={Wallet} tone="success" />
        <StatCard label="Em férias" value={emFerias} icon={Plane} tone="warning" />
        <StatCard label="Departamentos" value={new Set(items.map((f) => f.departamento)).size} icon={Briefcase} />
      </div>

      <div className="space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou cargo..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {departamentos.map((d) => (
            <button
              key={d}
              onClick={() => setDep(d)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                dep === d ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="py-16 text-center text-sm text-muted-foreground">Carregando...</p>}
      {isError && <p className="py-16 text-center text-sm text-destructive">Erro ao carregar funcionários.</p>}
      {!isLoading && items.length === 0 && (
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Nenhum funcionário cadastrado.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((f) => (
          <div key={f.id} className="group relative flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
            <button
              onClick={() => handleDelete(f)}
              className="absolute right-3 top-3 hidden rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive group-hover:block"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <Avatar name={f.nome} className="h-11 w-11" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{f.nome}</p>
                <p className="truncate text-xs text-muted-foreground">{f.cargo ?? "Sem cargo definido"}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {f.departamento && <Badge variant="secondary">{f.departamento}</Badge>}
              <Badge variant={SITUACAO_VARIANT[f.situacao]}>{f.situacao}</Badge>
            </div>
            <div className="space-y-1 border-t pt-2.5 text-xs text-muted-foreground">
              {f.telefone && (
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 shrink-0" /> {f.telefone}
                </p>
              )}
              <p>{formatDocumento(f.cpf)}</p>
            </div>
            <div className="flex items-center justify-between border-t pt-2.5">
              <span className="text-xs text-muted-foreground">
                {f.admissao ? new Date(f.admissao).toLocaleDateString("pt-BR") : "—"}
              </span>
              <span className="tnum text-sm font-semibold">{formatCurrency(f.salario)}</span>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo funcionário</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Nome completo *</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Cargo</Label>
              <Input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Departamento</Label>
              <Input value={form.departamento} onChange={(e) => setForm({ ...form, departamento: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>CPF</Label>
              <Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Admissão</Label>
              <Input type="date" value={form.admissao} onChange={(e) => setForm({ ...form, admissao: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Salário</Label>
              <Input type="number" value={form.salario} onChange={(e) => setForm({ ...form, salario: e.target.value })} />
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
