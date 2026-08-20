import { ChevronRight, Lock, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

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
import { apiErrorMessage } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";

import { useCreatePlanoConta, useDeletePlanoConta, usePlanoContas } from "./api";
import type { NaturezaConta, PlanoConta, PlanoContaNode, TipoConta } from "./types";

const TIPO_LABEL: Record<TipoConta, string> = {
  ativo: "Ativo",
  passivo: "Passivo",
  patrimonio_liquido: "Patrimônio Líquido",
  receita: "Receita",
  despesa: "Despesa",
};

const TIPO_COLOR: Record<TipoConta, string> = {
  ativo: "border-l-sky-500 text-sky-600 dark:text-sky-400",
  passivo: "border-l-rose-500 text-rose-600 dark:text-rose-400",
  patrimonio_liquido: "border-l-violet-500 text-violet-600 dark:text-violet-400",
  receita: "border-l-emerald-500 text-emerald-600 dark:text-emerald-400",
  despesa: "border-l-amber-500 text-amber-600 dark:text-amber-400",
};

const NATUREZA_LABEL: Record<NaturezaConta, string> = { devedora: "Devedora", credora: "Credora" };

function buildTree(contas: PlanoConta[]): PlanoContaNode[] {
  const byId = new Map<number, PlanoContaNode>(contas.map((c) => [c.id, { ...c, filhos: [] }]));
  const roots: PlanoContaNode[] = [];
  for (const node of byId.values()) {
    if (node.conta_pai_id && byId.has(node.conta_pai_id)) {
      byId.get(node.conta_pai_id)!.filhos.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function Node({
  node,
  depth,
  onAddChild,
  onDelete,
}: {
  node: PlanoContaNode;
  depth: number;
  onAddChild: (pai: PlanoConta) => void;
  onDelete: (conta: PlanoConta) => void;
}) {
  const [open, setOpen] = React.useState(true);
  const hasFilhos = node.filhos.length > 0;
  const saldo = Number(node.saldo_atual);

  return (
    <div>
      <div
        className={cn(
          "group flex items-center justify-between gap-2 border-l-4 px-3 py-2 hover:bg-muted/40",
          TIPO_COLOR[node.tipo],
        )}
        style={{ paddingLeft: depth * 20 + 12 }}
      >
        <button className="flex flex-1 items-center gap-2 text-left" onClick={() => hasFilhos && setOpen((v) => !v)}>
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
              hasFilhos && open && "rotate-90",
              !hasFilhos && "opacity-0",
            )}
          />
          <span className="font-mono text-xs text-muted-foreground">{node.codigo}</span>
          <span className={cn("text-sm font-medium text-foreground", !node.aceita_lancamento && "font-semibold")}>
            {node.nome}
          </span>
          {!node.aceita_lancamento && <Lock className="h-3 w-3 text-muted-foreground" />}
        </button>
        <div className="flex items-center gap-3">
          {node.aceita_lancamento && (
            <span className="tnum text-sm font-medium text-foreground">{formatCurrency(saldo)}</span>
          )}
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button size="sm" variant="ghost" onClick={() => onAddChild(node)}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onDelete(node)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
      {hasFilhos && open && (
        <div>
          {node.filhos.map((filho) => (
            <Node key={filho.id} node={filho} depth={depth + 1} onAddChild={onAddChild} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

const EMPTY = {
  codigo: "",
  nome: "",
  tipo: "ativo" as TipoConta,
  natureza: "devedora" as NaturezaConta,
  conta_pai_id: "" as string | number,
  aceita_lancamento: true,
};

export function SecaoPlanoContas() {
  const { data: contas = [], isLoading } = usePlanoContas();
  const createMut = useCreatePlanoConta();
  const deleteMut = useDeletePlanoConta();

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY);

  const tree = React.useMemo(() => buildTree(contas), [contas]);

  function abrirNova(pai?: PlanoConta) {
    setForm({
      ...EMPTY,
      conta_pai_id: pai ? pai.id : "",
      tipo: pai?.tipo ?? "ativo",
      natureza: pai?.natureza ?? "devedora",
    });
    setOpen(true);
  }

  async function salvar() {
    if (!form.codigo.trim() || !form.nome.trim()) {
      toast.error("Informe código e nome da conta");
      return;
    }
    try {
      await createMut.mutateAsync({
        codigo: form.codigo.trim(),
        nome: form.nome.trim(),
        tipo: form.tipo,
        natureza: form.natureza,
        conta_pai_id: form.conta_pai_id ? Number(form.conta_pai_id) : null,
        aceita_lancamento: form.aceita_lancamento,
      });
      toast.success("Conta criada");
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível criar a conta"));
    }
  }

  async function remover(conta: PlanoConta) {
    try {
      await deleteMut.mutateAsync(conta.id);
      toast.success("Conta removida");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível remover a conta"));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">Plano de contas</h3>
          <p className="text-xs text-muted-foreground">
            Estrutura hierárquica: contas sintéticas (grupos <Lock className="inline h-3 w-3" />) e analíticas
            (recebem lançamento).
          </p>
        </div>
        <Button size="sm" onClick={() => abrirNova()}>
          <Plus className="h-3.5 w-3.5" /> Nova conta
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(TIPO_LABEL).map(([k, v]) => (
          <span key={k} className={cn("flex items-center gap-1.5", TIPO_COLOR[k as TipoConta].split(" ")[1])}>
            <span className={cn("h-2 w-2 rounded-full", TIPO_COLOR[k as TipoConta].replace("border-l-", "bg-"))} />
            {v}
          </span>
        ))}
      </div>

      <div className="rounded-lg border">
        {isLoading && <p className="p-6 text-center text-sm text-muted-foreground">Carregando plano de contas...</p>}
        {!isLoading && tree.length === 0 && (
          <p className="p-10 text-center text-sm text-muted-foreground">Nenhuma conta cadastrada ainda.</p>
        )}
        {!isLoading &&
          tree.map((node) => (
            <Node key={node.id} node={node} depth={0} onAddChild={abrirNova} onDelete={remover} />
          ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova conta contábil</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Código *</Label>
              <Input
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                placeholder="Ex.: 1.1.02"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoConta })}>
                {Object.entries(TIPO_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Natureza</Label>
              <Select
                value={form.natureza}
                onChange={(e) => setForm({ ...form, natureza: e.target.value as NaturezaConta })}
              >
                {Object.entries(NATUREZA_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Conta pai</Label>
              <Select
                value={form.conta_pai_id}
                onChange={(e) => setForm({ ...form, conta_pai_id: e.target.value })}
              >
                <option value="">Nenhuma (conta raiz)</option>
                {contas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.codigo} — {c.nome}
                  </option>
                ))}
              </Select>
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="font-normal">Aceita lançamento direto</Label>
                <p className="text-xs text-muted-foreground">
                  Desative para contas sintéticas (grupos que só somam as filhas)
                </p>
              </div>
              <Switch
                checked={form.aceita_lancamento}
                onCheckedChange={(v) => setForm({ ...form, aceita_lancamento: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={salvar} disabled={createMut.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
