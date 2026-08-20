import {
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  LockOpen,
  Plus,
  Wallet,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader, StatCard } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatDateTime } from "@/lib/format";
import { formatCurrency } from "@/lib/utils";
import {
  useAbrirCaixa,
  useCaixaAtual,
  useFecharCaixa,
  useRegistrarMovimentoCaixa,
} from "./api";
import type { TipoMovimentoCaixa } from "./types";

const TIPO_META: Record<TipoMovimentoCaixa, { label: string; variant: "success" | "default" | "destructive" | "secondary"; sign: number }> = {
  venda: { label: "Venda", variant: "success", sign: 1 },
  suprimento: { label: "Suprimento", variant: "default", sign: 1 },
  sangria: { label: "Sangria", variant: "destructive", sign: -1 },
  estorno_venda: { label: "Estorno de venda", variant: "secondary", sign: -1 },
};

export function CaixaPage() {
  const { data: sessao, isLoading } = useCaixaAtual();
  const abrirMut = useAbrirCaixa();
  const fecharMut = useFecharCaixa();
  const movMut = useRegistrarMovimentoCaixa();

  const [openAbrir, setOpenAbrir] = React.useState(false);
  const [saldoAbertura, setSaldoAbertura] = React.useState("0");
  const [openMov, setOpenMov] = React.useState<TipoMovimentoCaixa | null>(null);
  const [movDescricao, setMovDescricao] = React.useState("");
  const [movValor, setMovValor] = React.useState("");

  const aberto = !!sessao;
  const movs = sessao?.movimentos ?? [];
  const entradas = movs.filter((m) => TIPO_META[m.tipo].sign > 0).reduce((a, m) => a + Number(m.valor), 0);
  const saidas = movs.filter((m) => TIPO_META[m.tipo].sign < 0).reduce((a, m) => a + Number(m.valor), 0);

  async function abrir() {
    try {
      await abrirMut.mutateAsync(saldoAbertura || "0");
      toast.success("Caixa aberto");
      setOpenAbrir(false);
      setSaldoAbertura("0");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível abrir o caixa"));
    }
  }

  async function fechar() {
    if (!confirm("Fechar o caixa? Não será possível lançar mais movimentos nesta sessão.")) return;
    try {
      const r = await fecharMut.mutateAsync();
      toast.success(`Caixa fechado. Saldo: ${formatCurrency(r.saldo_fechamento ?? "0")}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível fechar o caixa"));
    }
  }

  function openMovDialog(tipo: TipoMovimentoCaixa) {
    setMovDescricao("");
    setMovValor("");
    setOpenMov(tipo);
  }

  async function salvarMovimento() {
    if (!openMov) return;
    if (!movValor || Number(movValor) <= 0) return toast.error("Informe um valor válido");
    try {
      await movMut.mutateAsync({
        tipo: openMov,
        descricao: movDescricao || (openMov === "sangria" ? "Sangria manual" : "Suprimento manual"),
        valor: movValor,
      });
      toast.success(openMov === "sangria" ? "Sangria registrada" : "Suprimento registrado");
      setOpenMov(null);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível registrar"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        path="/caixa"
        actions={
          isLoading ? null : aberto ? (
            <Button variant="destructive" onClick={fechar} disabled={fecharMut.isPending}>
              <Lock /> Fechar caixa
            </Button>
          ) : (
            <Button onClick={() => setOpenAbrir(true)}>
              <LockOpen /> Abrir caixa
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Saldo em caixa" value={formatCurrency(sessao?.saldo_atual ?? 0)} icon={Wallet} tone="success" />
        <StatCard label="Entradas" value={formatCurrency(entradas)} icon={ArrowDownLeft} />
        <StatCard label="Saídas" value={formatCurrency(saidas)} icon={ArrowUpRight} tone="destructive" />
        <StatCard label="Situação" value={aberto ? "Aberto" : "Fechado"} icon={aberto ? LockOpen : Lock} tone={aberto ? "success" : "warning"} />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Movimentos do dia</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={!aberto} onClick={() => openMovDialog("suprimento")}>
              <Plus className="h-3.5 w-3.5" /> Suprimento
            </Button>
            <Button size="sm" variant="outline" disabled={!aberto} onClick={() => openMovDialog("sangria")}>
              <ArrowUpRight className="h-3.5 w-3.5" /> Sangria
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {!aberto && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum caixa aberto no momento. Abra o caixa para começar a lançar movimentos.
            </p>
          )}
          {movs.length === 0 && aberto && (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum movimento ainda.</p>
          )}
          {movs.map((m) => {
            const meta = TIPO_META[m.tipo];
            return (
              <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                  <div>
                    <p className="text-sm font-medium">{m.descricao}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(m.data)}</p>
                  </div>
                </div>
                <span className={`font-semibold ${meta.sign > 0 ? "text-success" : "text-destructive"}`}>
                  {meta.sign > 0 ? "+" : "−"}{formatCurrency(m.valor)}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={openAbrir} onOpenChange={setOpenAbrir}>
        <DialogContent>
          <DialogHeader><DialogTitle>Abrir caixa</DialogTitle></DialogHeader>
          <div className="space-y-1.5">
            <Label>Saldo inicial (troco)</Label>
            <Input type="number" value={saldoAbertura} onChange={(e) => setSaldoAbertura(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAbrir(false)}>Cancelar</Button>
            <Button onClick={abrir} disabled={abrirMut.isPending}>Abrir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openMov !== null} onOpenChange={(v) => !v && setOpenMov(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{openMov === "sangria" ? "Registrar sangria" : "Registrar suprimento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Input value={movDescricao} onChange={(e) => setMovDescricao(e.target.value)} placeholder={openMov === "sangria" ? "Depósito bancário" : "Troco extra"} />
            </div>
            <div className="space-y-1.5">
              <Label>Valor *</Label>
              <Input type="number" value={movValor} onChange={(e) => setMovValor(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenMov(null)}>Cancelar</Button>
            <Button onClick={salvarMovimento} disabled={movMut.isPending}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
