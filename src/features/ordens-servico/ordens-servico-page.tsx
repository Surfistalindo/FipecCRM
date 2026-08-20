import { Plus, Wrench } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { PageHeader, StatCard } from "@/components/page-header";
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
import { Textarea } from "@/components/ui/textarea";
import { useClientes } from "@/features/clientes/api";
import { useFuncionarios } from "@/features/funcionarios/api";
import { apiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { formatCurrency } from "@/lib/utils";

import { useCreateOrdemServico, useOrdensServico } from "./api";
import type { StatusOS } from "./types";

const COLUNAS: { key: StatusOS; label: string; accent: string }[] = [
  { key: "aberta", label: "Aberta", accent: "border-t-slate-400" },
  { key: "em_andamento", label: "Em andamento", accent: "border-t-blue-500" },
  { key: "aguardando_peca", label: "Aguardando peça", accent: "border-t-amber-500" },
  { key: "concluida", label: "Concluída", accent: "border-t-emerald-500" },
  { key: "entregue", label: "Entregue", accent: "border-t-primary" },
];

const EMPTY = { cliente_id: "", tecnico_id: "", descricao_problema: "", valor_mao_obra: "0" };

export function OrdensServicoPage() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY);

  const { data } = useOrdensServico();
  const { data: clientesData } = useClientes({ page: 1, size: 100 });
  const { data: funcionariosData } = useFuncionarios({ size: 100 });
  const funcionarios = funcionariosData?.items ?? [];
  const createMut = useCreateOrdemServico();

  const ordens = data?.items ?? [];
  const clientes = clientesData?.items ?? [];

  const abertas = ordens.filter((o) => !["entregue", "cancelada"].includes(o.status)).length;
  const totalMes = ordens.reduce((a, o) => a + Number(o.total), 0);

  async function salvar() {
    if (!form.cliente_id || !form.descricao_problema) {
      toast.error("Selecione o cliente e descreva o problema");
      return;
    }
    try {
      const nova = await createMut.mutateAsync({
        cliente_id: Number(form.cliente_id),
        tecnico_id: form.tecnico_id ? Number(form.tecnico_id) : undefined,
        descricao_problema: form.descricao_problema,
        valor_mao_obra: form.valor_mao_obra || "0",
      });
      toast.success("Ordem de serviço criada");
      setForm(EMPTY);
      setOpen(false);
      navigate(`/ordens-servico/${nova.id}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível criar"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader path="/ordens-servico" actions={<Button onClick={() => setOpen(true)}><Plus /> Nova OS</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="OS em aberto" value={abertas} icon={Wrench} tone="warning" />
        <StatCard label="Valor total (últimas 100)" value={formatCurrency(totalMes)} icon={Wrench} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {COLUNAS.map((col) => {
          const lista = ordens.filter((o) => o.status === col.key);
          return (
            <div key={col.key} className={`rounded-xl border border-t-4 bg-muted/30 p-3 ${col.accent}`}>
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="text-sm font-semibold">{col.label}</span>
                <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium">{lista.length}</span>
              </div>
              <div className="space-y-2">
                {lista.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => navigate(`/ordens-servico/${o.id}`)}
                    className="cursor-pointer rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-xs font-semibold">{o.numero}</p>
                      <span className="text-[10px] text-muted-foreground">{formatDate(o.data_abertura)}</span>
                    </div>
                    <p className="mt-1 truncate text-sm">{o.cliente.nome}</p>
                    {o.equipamento && (
                      <p className="truncate text-xs text-muted-foreground">{o.equipamento.descricao}</p>
                    )}
                    <p className="mt-1.5 text-sm font-bold">{formatCurrency(o.total)}</p>
                  </div>
                ))}
                {lista.length === 0 && (
                  <p className="px-1 py-6 text-center text-xs text-muted-foreground">Sem OS</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova ordem de serviço</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Cliente *</Label>
              <Select value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}>
                <option value="">Selecione</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Técnico responsável</Label>
              <Select value={form.tecnico_id} onChange={(e) => setForm({ ...form, tecnico_id: e.target.value })}>
                <option value="">A definir</option>
                {funcionarios.map((f) => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Descrição do problema *</Label>
              <Textarea
                value={form.descricao_problema}
                onChange={(e) => setForm({ ...form, descricao_problema: e.target.value })}
                placeholder="Relato do cliente..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Valor da mão de obra (estimado)</Label>
              <Input type="number" value={form.valor_mao_obra} onChange={(e) => setForm({ ...form, valor_mao_obra: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={createMut.isPending}>Criar OS</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
