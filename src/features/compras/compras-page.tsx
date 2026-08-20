import { CheckCircle2, FileText, PackageOpen, Plus, Send, ShoppingBag, X } from "lucide-react";
import * as React from "react";
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
import { useFornecedores } from "@/features/fornecedores/api";
import { useProdutos } from "@/features/produtos/api";
import { apiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { cn, formatCurrency } from "@/lib/utils";

import { useCancelarCompra, useCompras, useCreateCompra, useReceberCompra } from "./api";
import type { Compra, CompraItemInput, StatusCompra } from "./types";

const COLUNAS: { status: StatusCompra; label: string; icon: typeof FileText; accent: string }[] = [
  { status: "cotacao", label: "Cotação", icon: FileText, accent: "border-t-muted-foreground/40" },
  { status: "pedido", label: "Pedido enviado", icon: Send, accent: "border-t-primary" },
  { status: "recebido", label: "Recebido", icon: CheckCircle2, accent: "border-t-success" },
];

interface LinhaCarrinho extends CompraItemInput {
  nome: string;
  precoSugerido: string;
}

function CardCompra({
  c,
  onReceber,
  onCancelar,
}: {
  c: Compra;
  onReceber: (id: number) => void;
  onCancelar: (id: number) => void;
}) {
  const acionavel = c.status === "cotacao" || c.status === "pedido";
  return (
    <div className="group rounded-lg border bg-card p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs font-medium text-muted-foreground">{c.numero}</span>
        <span className="text-xs text-muted-foreground">{formatDate(c.data)}</span>
      </div>
      <p className="mt-1 truncate text-sm font-medium">{c.fornecedor?.razao_social ?? "Sem fornecedor"}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{c.itens.length} item(ns)</span>
        <span className="text-sm font-semibold tnum">{formatCurrency(c.total)}</span>
      </div>
      {acionavel && (
        <div className="mt-3 flex gap-1.5 border-t pt-2.5">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onReceber(c.id)}>
            Receber
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onCancelar(c.id)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function ComprasPage() {
  const [open, setOpen] = React.useState(false);
  const [fornecedorId, setFornecedorId] = React.useState("");
  const [status, setStatus] = React.useState<StatusCompra>("cotacao");
  const [produtoSel, setProdutoSel] = React.useState("");
  const [qtdSel, setQtdSel] = React.useState("1");
  const [carrinho, setCarrinho] = React.useState<LinhaCarrinho[]>([]);

  const { data, isLoading, isError } = useCompras({ size: 60 });
  const { data: fornecedoresData } = useFornecedores({ size: 100 });
  const { data: produtosData } = useProdutos({ size: 200 });
  const createMut = useCreateCompra();
  const receberMut = useReceberCompra();
  const cancelarMut = useCancelarCompra();

  const items = data?.items ?? [];
  const fornecedores = fornecedoresData?.items ?? [];
  const produtos = produtosData?.items ?? [];

  const emAberto = items.filter((c) => c.status === "pedido" || c.status === "cotacao").length;
  const totalMes = items.reduce((a, c) => a + Number(c.total), 0);

  function addItem() {
    const produto = produtos.find((p) => p.id === Number(produtoSel));
    if (!produto) return toast.error("Selecione um produto");
    const qtd = Number(qtdSel);
    if (!qtd || qtd <= 0) return toast.error("Quantidade inválida");
    setCarrinho((prev) => [
      ...prev,
      { produto_id: produto.id, quantidade: qtdSel, nome: produto.nome, precoSugerido: produto.preco_custo },
    ]);
    setProdutoSel("");
    setQtdSel("1");
  }

  function removeItem(idx: number) {
    setCarrinho((prev) => prev.filter((_, i) => i !== idx));
  }

  const totalCarrinho = carrinho.reduce((a, i) => a + Number(i.precoSugerido) * Number(i.quantidade), 0);

  function resetForm() {
    setFornecedorId("");
    setStatus("cotacao");
    setCarrinho([]);
    setProdutoSel("");
    setQtdSel("1");
  }

  async function save() {
    if (carrinho.length === 0) return toast.error("Adicione ao menos um item");
    try {
      await createMut.mutateAsync({
        fornecedor_id: fornecedorId ? Number(fornecedorId) : undefined,
        status,
        itens: carrinho.map((c) => ({ produto_id: c.produto_id, quantidade: c.quantidade })),
      });
      toast.success("Pedido de compra registrado");
      resetForm();
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível registrar"));
    }
  }

  async function receber(id: number) {
    try {
      await receberMut.mutateAsync(id);
      toast.success("Compra recebida: itens lançados no estoque");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível receber"));
    }
  }

  async function cancelar(id: number) {
    if (!confirm("Cancelar este pedido de compra?")) return;
    try {
      await cancelarMut.mutateAsync(id);
      toast.success("Pedido cancelado");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível cancelar"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader path="/compras" actions={<Button onClick={() => setOpen(true)}><Plus /> Novo pedido</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Compras no total" value={formatCurrency(totalMes)} icon={ShoppingBag} tone="success" />
        <StatCard label="Pedidos em aberto" value={emAberto} icon={PackageOpen} tone="warning" />
        <StatCard label="Total de pedidos" value={data?.total ?? 0} icon={ShoppingBag} />
      </div>

      {isLoading && <p className="py-16 text-center text-sm text-muted-foreground">Carregando...</p>}
      {isError && <p className="py-16 text-center text-sm text-destructive">Erro ao carregar compras.</p>}

      {/* ---- Board por status ---- */}
      {!isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLUNAS.map((col) => {
            const doColuna = items.filter((c) => c.status === col.status);
            const totalColuna = doColuna.reduce((a, c) => a + Number(c.total), 0);
            const Icon = col.icon;
            return (
              <div key={col.status} className={cn("rounded-xl border border-t-4 bg-muted/20", col.accent)}>
                <div className="flex items-center gap-2 px-4 py-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">{col.label}</h3>
                  <span className="ml-auto rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {doColuna.length}
                  </span>
                </div>
                {doColuna.length > 0 && (
                  <p className="px-4 pb-2 text-xs text-muted-foreground">Total {formatCurrency(totalColuna)}</p>
                )}
                <div className="space-y-2 p-2">
                  {doColuna.length === 0 && (
                    <p className="py-8 text-center text-xs text-muted-foreground">Nenhum pedido aqui.</p>
                  )}
                  {doColuna.map((c) => (
                    <CardCompra key={c.id} c={c} onReceber={receber} onCancelar={cancelar} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Novo pedido de compra</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Fornecedor</Label>
                <Select value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)}>
                  <option value="">Selecione</option>
                  {fornecedores.map((f) => (
                    <option key={f.id} value={f.id}>{f.nome_fantasia || f.razao_social}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status inicial</Label>
                <Select value={status} onChange={(e) => setStatus(e.target.value as StatusCompra)}>
                  <option value="cotacao">Cotação</option>
                  <option value="pedido">Pedido enviado</option>
                  <option value="recebido">Já recebido (dá entrada no estoque)</option>
                </Select>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <Label className="mb-2 block">Adicionar item</Label>
              <div className="flex gap-2">
                <Select className="flex-1" value={produtoSel} onChange={(e) => setProdutoSel(e.target.value)}>
                  <option value="">Selecione o produto</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome} — custo {formatCurrency(p.preco_custo)}</option>
                  ))}
                </Select>
                <Input className="w-20" type="number" min={1} value={qtdSel} onChange={(e) => setQtdSel(e.target.value)} />
                <Button type="button" variant="outline" onClick={addItem}>Add</Button>
              </div>

              {carrinho.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {carrinho.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5 text-sm">
                      <span>{item.quantidade}x {item.nome}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{formatCurrency(Number(item.precoSugerido) * Number(item.quantidade))}</span>
                        <button onClick={() => removeItem(idx)} className="text-muted-foreground hover:text-destructive">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-2 text-sm font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(totalCarrinho)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={createMut.isPending}>Registrar pedido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
