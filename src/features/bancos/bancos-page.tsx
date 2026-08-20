import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Building2,
  Plus,
  Wallet,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader, StatCard } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { cn, formatCurrency } from "@/lib/utils";

import {
  useContasBancarias,
  useCreateContaBancaria,
  useExtrato,
  useRegistrarMovimentoBancario,
  useTransferir,
} from "./api";
import type { TipoContaBancaria, TipoMovimentoBancario } from "./types";

const TIPO_LABEL: Record<TipoMovimentoBancario, string> = {
  deposito: "Depósito",
  saque: "Saque",
  pix: "PIX",
  ted: "TED",
  tarifa: "Tarifa",
  transferencia_entrada: "Transferência (entrada)",
  transferencia_saida: "Transferência (saída)",
};

const TIPO_SAIDA = new Set<TipoMovimentoBancario>(["saque", "ted", "tarifa", "transferencia_saida"]);

const EMPTY_CONTA: { banco: string; agencia: string; conta: string; tipo_conta: TipoContaBancaria; saldo_inicial: string } = {
  banco: "",
  agencia: "",
  conta: "",
  tipo_conta: "corrente",
  saldo_inicial: "0",
};
const EMPTY_MOVIMENTO = { tipo: "deposito" as TipoMovimentoBancario, descricao: "", valor: "" };
const EMPTY_TRANSFERENCIA = { conta_destino_id: "", valor: "", descricao: "" };

export function BancosPage() {
  const [selecionada, setSelecionada] = React.useState<number | null>(null);
  const [openConta, setOpenConta] = React.useState(false);
  const [openMovimento, setOpenMovimento] = React.useState(false);
  const [openTransferencia, setOpenTransferencia] = React.useState(false);
  const [formConta, setFormConta] = React.useState(EMPTY_CONTA);
  const [formMovimento, setFormMovimento] = React.useState(EMPTY_MOVIMENTO);
  const [formTransferencia, setFormTransferencia] = React.useState(EMPTY_TRANSFERENCIA);

  const { data: contas = [] } = useContasBancarias();
  const { data: extratoPage } = useExtrato(selecionada);
  const createContaMut = useCreateContaBancaria();
  const movimentoMut = useRegistrarMovimentoBancario();
  const transferirMut = useTransferir();

  React.useEffect(() => {
    if (selecionada === null && contas.length > 0) setSelecionada(contas[0].id);
  }, [contas, selecionada]);

  const contaAtual = contas.find((c) => c.id === selecionada);
  const saldoTotal = contas.reduce((a, c) => a + Number(c.saldo), 0);
  const extrato = extratoPage?.items ?? [];

  async function salvarConta() {
    if (!formConta.banco || !formConta.agencia || !formConta.conta) {
      toast.error("Preencha banco, agência e conta");
      return;
    }
    try {
      const nova = await createContaMut.mutateAsync(formConta);
      toast.success("Conta bancária criada");
      setFormConta(EMPTY_CONTA);
      setOpenConta(false);
      setSelecionada(nova.id);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível criar a conta"));
    }
  }

  async function salvarMovimento() {
    if (!selecionada || !formMovimento.descricao || !formMovimento.valor) {
      toast.error("Preencha descrição e valor");
      return;
    }
    try {
      await movimentoMut.mutateAsync({ conta_bancaria_id: selecionada, ...formMovimento });
      toast.success("Movimento registrado");
      setFormMovimento(EMPTY_MOVIMENTO);
      setOpenMovimento(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível registrar"));
    }
  }

  async function salvarTransferencia() {
    if (!selecionada || !formTransferencia.conta_destino_id || !formTransferencia.valor) {
      toast.error("Selecione a conta destino e o valor");
      return;
    }
    try {
      await transferirMut.mutateAsync({
        conta_origem_id: selecionada,
        conta_destino_id: Number(formTransferencia.conta_destino_id),
        valor: formTransferencia.valor,
        descricao: formTransferencia.descricao || undefined,
      });
      toast.success("Transferência realizada");
      setFormTransferencia(EMPTY_TRANSFERENCIA);
      setOpenTransferencia(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível transferir"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader path="/bancos" actions={<Button onClick={() => setOpenConta(true)}><Plus /> Nova conta</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Saldo total" value={formatCurrency(saldoTotal)} icon={Wallet} />
        <StatCard label="Contas ativas" value={contas.filter((c) => c.ativo).length} icon={Building2} />
        <StatCard
          label="Movimentos da conta selecionada"
          value={extratoPage?.total ?? 0}
          icon={ArrowLeftRight}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {contas.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelecionada(c.id)}
            className={cn(
              "flex flex-col rounded-xl border p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
              selecionada === c.id ? "border-primary bg-primary/5" : "bg-card",
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <Badge variant="secondary">{c.tipo_conta === "corrente" ? "Corrente" : "Poupança"}</Badge>
            </div>
            <p className="mt-3 font-semibold">{c.banco}</p>
            <p className="text-xs text-muted-foreground">Ag. {c.agencia} · Conta {c.conta}</p>
            <p className="mt-3 text-xl font-bold tnum">{formatCurrency(c.saldo)}</p>
          </button>
        ))}
        {contas.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
            Nenhuma conta bancária cadastrada.
          </div>
        )}
      </div>

      {contaAtual && (
        <Card>
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{contaAtual.banco} · Ag. {contaAtual.agencia} / {contaAtual.conta}</p>
              <p className="text-xs text-muted-foreground">Extrato de movimentações</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setOpenMovimento(true)}>
                <Plus className="h-3.5 w-3.5" /> Movimento
              </Button>
              <Button size="sm" variant="outline" onClick={() => setOpenTransferencia(true)}>
                <ArrowLeftRight className="h-3.5 w-3.5" /> Transferir
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extrato.map((m) => {
                const saida = TIPO_SAIDA.has(m.tipo);
                return (
                  <TableRow key={m.id}>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(m.data)}</TableCell>
                    <TableCell>
                      <Badge variant={saida ? "destructive" : "success"} className="gap-1">
                        {saida ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                        {TIPO_LABEL[m.tipo]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{m.descricao}</TableCell>
                    <TableCell className={cn("text-right text-sm font-medium tnum", saida ? "text-destructive" : "text-success")}>
                      {saida ? "-" : "+"}{formatCurrency(m.valor)}
                    </TableCell>
                  </TableRow>
                );
              })}
              {extrato.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    Nenhuma movimentação registrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Nova conta */}
      <Dialog open={openConta} onOpenChange={setOpenConta}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova conta bancária</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Banco *</Label>
              <Input value={formConta.banco} onChange={(e) => setFormConta({ ...formConta, banco: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Agência *</Label>
              <Input value={formConta.agencia} onChange={(e) => setFormConta({ ...formConta, agencia: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Conta *</Label>
              <Input value={formConta.conta} onChange={(e) => setFormConta({ ...formConta, conta: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={formConta.tipo_conta} onChange={(e) => setFormConta({ ...formConta, tipo_conta: e.target.value as "corrente" | "poupanca" })}>
                <option value="corrente">Corrente</option>
                <option value="poupanca">Poupança</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Saldo inicial</Label>
              <Input type="number" value={formConta.saldo_inicial} onChange={(e) => setFormConta({ ...formConta, saldo_inicial: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenConta(false)}>Cancelar</Button>
            <Button onClick={salvarConta} disabled={createContaMut.isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Novo movimento */}
      <Dialog open={openMovimento} onOpenChange={setOpenMovimento}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo movimento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={formMovimento.tipo} onChange={(e) => setFormMovimento({ ...formMovimento, tipo: e.target.value as TipoMovimentoBancario })}>
                <option value="deposito">Depósito</option>
                <option value="saque">Saque</option>
                <option value="pix">PIX</option>
                <option value="ted">TED</option>
                <option value="tarifa">Tarifa</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Descrição *</Label>
              <Input value={formMovimento.descricao} onChange={(e) => setFormMovimento({ ...formMovimento, descricao: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Valor *</Label>
              <Input type="number" value={formMovimento.valor} onChange={(e) => setFormMovimento({ ...formMovimento, valor: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenMovimento(false)}>Cancelar</Button>
            <Button onClick={salvarMovimento} disabled={movimentoMut.isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transferencia */}
      <Dialog open={openTransferencia} onOpenChange={setOpenTransferencia}>
        <DialogContent>
          <DialogHeader><DialogTitle>Transferir entre contas</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>De</Label>
              <Input disabled value={contaAtual ? `${contaAtual.banco} · ${contaAtual.conta}` : ""} />
            </div>
            <div className="space-y-1.5">
              <Label>Para *</Label>
              <Select
                value={formTransferencia.conta_destino_id}
                onChange={(e) => setFormTransferencia({ ...formTransferencia, conta_destino_id: e.target.value })}
              >
                <option value="">Selecione a conta destino</option>
                {contas.filter((c) => c.id !== selecionada).map((c) => (
                  <option key={c.id} value={c.id}>{c.banco} · {c.conta}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Valor *</Label>
              <Input type="number" value={formTransferencia.valor} onChange={(e) => setFormTransferencia({ ...formTransferencia, valor: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Input value={formTransferencia.descricao} onChange={(e) => setFormTransferencia({ ...formTransferencia, descricao: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenTransferencia(false)}>Cancelar</Button>
            <Button onClick={salvarTransferencia} disabled={transferirMut.isPending}>Transferir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
