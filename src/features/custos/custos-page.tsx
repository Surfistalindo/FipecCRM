import { Calculator, PieChart, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader, StatCard } from "@/components/page-header";
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
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentDonutChart, RankingBarChart } from "@/features/dashboard/charts";
import { apiErrorMessage } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";

import { useCreateCustoFixo, useCustosFixos, useCustosResumo, useDeleteCustoFixo } from "./api";
import type { CategoriaCustoFixo } from "./types";

const CATEGORIA_LABEL: Record<CategoriaCustoFixo, string> = {
  aluguel: "Aluguel",
  salarios: "Salários",
  energia: "Energia",
  agua: "Água",
  internet: "Internet",
  impostos: "Impostos",
  marketing: "Marketing",
  manutencao: "Manutenção",
  outros: "Outros",
};

const EMPTY = { nome: "", categoria: "outros" as CategoriaCustoFixo, valor_mensal: "" };

export function CustosPage() {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY);

  const { data: custos = [] } = useCustosFixos();
  const { data: resumo } = useCustosResumo();
  const createMut = useCreateCustoFixo();
  const deleteMut = useDeleteCustoFixo();

  async function salvar() {
    if (!form.nome || !form.valor_mensal) {
      toast.error("Preencha nome e valor mensal");
      return;
    }
    try {
      await createMut.mutateAsync(form);
      toast.success("Custo fixo cadastrado");
      setForm(EMPTY);
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível salvar"));
    }
  }

  async function remover(id: number) {
    try {
      await deleteMut.mutateAsync(id);
      toast.success("Custo fixo removido");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível remover"));
    }
  }

  const margemLiquidaPositiva = (resumo?.margem_liquida ? Number(resumo.margem_liquida) : 0) >= 0;

  return (
    <div className="space-y-6">
      <PageHeader path="/custos" actions={<Button onClick={() => setOpen(true)}><Plus /> Novo custo fixo</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Custos fixos do mês"
          value={formatCurrency(resumo?.total_custos_fixos_mes ?? 0)}
          icon={Calculator}
        />
        <StatCard label="Receita do mês" value={formatCurrency(resumo?.receita_mes ?? 0)} icon={TrendingUp} tone="success" />
        <StatCard
          label="Margem bruta"
          value={formatCurrency(resumo?.margem_bruta ?? 0)}
          icon={PieChart}
          hint={resumo?.margem_bruta_pct != null ? `${resumo.margem_bruta_pct.toFixed(1)}% da receita` : undefined}
        />
        <StatCard
          label="Margem líquida"
          value={formatCurrency(resumo?.margem_liquida ?? 0)}
          icon={margemLiquidaPositiva ? TrendingUp : TrendingDown}
          tone={margemLiquidaPositiva ? "success" : "destructive"}
          hint={resumo?.margem_liquida_pct != null ? `${resumo.margem_liquida_pct.toFixed(1)}% da receita` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rentabilidade por produto (mês)</CardTitle>
          </CardHeader>
          <CardContent>
            <RankingBarChart
              data={(resumo?.rentabilidade_produtos ?? []).map((p) => ({
                label: p.produto,
                value: Number(p.margem),
                sublabel: p.margem_pct != null ? `${p.margem_pct.toFixed(0)}% margem` : undefined,
              }))}
              valueFormatter={(v) => formatCurrency(v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custos fixos por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentDonutChart
              data={(resumo?.custos_por_categoria ?? []).map((c) => ({
                label: CATEGORIA_LABEL[c.categoria as CategoriaCustoFixo] ?? c.categoria,
                value: Number(c.total),
              }))}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Custos fixos cadastrados</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor mensal</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {custos.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.nome}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{CATEGORIA_LABEL[c.categoria]}</TableCell>
                <TableCell className={cn("text-right text-sm font-medium tnum")}>
                  {formatCurrency(c.valor_mensal)}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => remover(c.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {custos.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum custo fixo cadastrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo custo fixo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value as CategoriaCustoFixo })}>
                {Object.entries(CATEGORIA_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Valor mensal *</Label>
              <Input type="number" value={form.valor_mensal} onChange={(e) => setForm({ ...form, valor_mensal: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={createMut.isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
