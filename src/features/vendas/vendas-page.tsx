import { DollarSign, FileText, Minus, Plus, Receipt, Search, ShoppingCart, Trash2, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader, StatCard } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { useClientes } from "@/features/clientes/api";
import { useProdutos } from "@/features/produtos/api";
import { useVendedores } from "@/features/vendedores/api";
import { apiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { cn, formatCurrency } from "@/lib/utils";

import { useCancelarVenda, useCreateVenda, useEmitirNF, useVendas } from "./api";
import type { StatusNF } from "./types";

const NF_META: Record<StatusNF, { label: string; variant: "success" | "secondary" | "default" }> = {
  autorizada: { label: "NF-e autorizada", variant: "success" },
  emitida: { label: "NF-e emitida", variant: "default" },
  pendente: { label: "Sem NF-e", variant: "secondary" },
};

interface LinhaCarrinho {
  produto_id: number;
  nome: string;
  precoUnit: string;
  quantidade: number;
}

export function VendasPage() {
  const [open, setOpen] = React.useState(false);
  const [clienteId, setClienteId] = React.useState("");
  const [vendedorId, setVendedorId] = React.useState("");
  const [formaPagamento, setFormaPagamento] = React.useState("");
  const [buscaProduto, setBuscaProduto] = React.useState("");
  const [carrinho, setCarrinho] = React.useState<LinhaCarrinho[]>([]);

  const { data, isLoading, isError } = useVendas({ size: 30 });
  const { data: clientesData } = useClientes({ page: 1, size: 100 });
  const { data: vendedoresData } = useVendedores({ size: 100 });
  const { data: produtosData } = useProdutos({ size: 200 });
  const createMut = useCreateVenda();
  const emitirNfMut = useEmitirNF();
  const cancelarMut = useCancelarVenda();

  const items = data?.items ?? [];
  const clientes = clientesData?.items ?? [];
  const vendedores = vendedoresData?.items ?? [];
  const produtos = produtosData?.items ?? [];

  const hoje = new Date().toISOString().slice(0, 10);
  const totalDia = items.filter((v) => v.data === hoje).reduce((a, v) => a + Number(v.total), 0);
  const ticket = items.length ? items.reduce((a, v) => a + Number(v.total), 0) / items.length : 0;

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(buscaProduto.toLowerCase()) || (p.codigo ?? "").toLowerCase().includes(buscaProduto.toLowerCase()),
  );

  function addItem(produtoId: number) {
    const produto = produtos.find((p) => p.id === produtoId);
    if (!produto) return;
    setCarrinho((prev) => {
      const existente = prev.find((i) => i.produto_id === produtoId);
      if (existente) {
        return prev.map((i) => (i.produto_id === produtoId ? { ...i, quantidade: i.quantidade + 1 } : i));
      }
      return [...prev, { produto_id: produto.id, nome: produto.nome, precoUnit: produto.preco_venda, quantidade: 1 }];
    });
  }

  function alterarQtd(produtoId: number, delta: number) {
    setCarrinho((prev) =>
      prev
        .map((i) => (i.produto_id === produtoId ? { ...i, quantidade: i.quantidade + delta } : i))
        .filter((i) => i.quantidade > 0),
    );
  }

  function removeItem(produtoId: number) {
    setCarrinho((prev) => prev.filter((i) => i.produto_id !== produtoId));
  }

  const totalCarrinho = carrinho.reduce((a, i) => a + Number(i.precoUnit) * i.quantidade, 0);

  function resetForm() {
    setClienteId("");
    setVendedorId("");
    setFormaPagamento("");
    setCarrinho([]);
    setBuscaProduto("");
  }

  async function finalizar() {
    if (carrinho.length === 0) return toast.error("Adicione ao menos um item");
    try {
      await createMut.mutateAsync({
        cliente_id: clienteId ? Number(clienteId) : undefined,
        vendedor_id: vendedorId ? Number(vendedorId) : undefined,
        forma_pagamento: formaPagamento || undefined,
        itens: carrinho.map((c) => ({ produto_id: c.produto_id, quantidade: String(c.quantidade) })),
      });
      toast.success("Venda registrada");
      resetForm();
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível registrar a venda"));
    }
  }

  async function emitirNF(id: number) {
    try {
      await emitirNfMut.mutateAsync(id);
      toast.success("NF-e autorizada pela SEFAZ (simulado)");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível emitir a NF-e"));
    }
  }

  async function cancelar(id: number) {
    if (!confirm("Cancelar esta venda? O estoque será estornado.")) return;
    try {
      await cancelarMut.mutateAsync(id);
      toast.success("Venda cancelada e estoque estornado");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível cancelar"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        path="/vendas"
        actions={<Button onClick={() => setOpen(true)}><Plus /> Nova venda</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Vendas hoje" value={formatCurrency(totalDia)} icon={DollarSign} tone="success" />
        <StatCard label="Nº de vendas" value={data?.total ?? 0} icon={ShoppingCart} />
        <StatCard label="Ticket médio" value={formatCurrency(ticket)} icon={Receipt} tone="warning" />
        <StatCard label="NF-e pendentes" value={items.filter((v) => v.nf_status === "pendente" && v.status === "finalizada").length} icon={FileText} tone="destructive" />
      </div>

      <Card>
        <CardHeader><CardTitle>Últimas vendas</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Venda</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead className="text-center">Itens</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fiscal</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">Carregando...</TableCell></TableRow>
              )}
              {isError && (
                <TableRow><TableCell colSpan={8} className="py-10 text-center text-destructive">Erro ao carregar vendas.</TableCell></TableRow>
              )}
              {items.length === 0 && !isLoading && (
                <TableRow><TableCell colSpan={8} className="py-16 text-center text-muted-foreground">Nenhuma venda registrada.</TableCell></TableRow>
              )}
              {items.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono text-sm font-medium">{v.numero}</TableCell>
                  <TableCell>{v.cliente?.nome ?? "Consumidor final"}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{formatDate(v.data)}</TableCell>
                  <TableCell className="text-center">{v.itens.length}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(v.total)}</TableCell>
                  <TableCell>
                    {v.status === "cancelada" ? (
                      <Badge variant="destructive">Cancelada</Badge>
                    ) : (
                      <Badge variant="success">Finalizada</Badge>
                    )}
                  </TableCell>
                  <TableCell><Badge variant={NF_META[v.nf_status].variant}>{NF_META[v.nf_status].label}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {v.status === "finalizada" && v.nf_status === "pendente" && (
                        <Button size="sm" variant="outline" onClick={() => emitirNF(v.id)}>Emitir NF-e</Button>
                      )}
                      {v.status === "finalizada" && (
                        <Button size="sm" variant="ghost" onClick={() => cancelar(v.id)}>Cancelar</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ---- PDV: builder de venda em tela cheia ---- */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="flex h-[85vh] max-w-6xl flex-col p-0">
          <DialogHeader className="border-b p-4">
            <DialogTitle>Nova venda</DialogTitle>
          </DialogHeader>

          <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_360px]">
            {/* ---- Catalogo de produtos ---- */}
            <div className="flex flex-col overflow-hidden border-r">
              <div className="border-b p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produto por nome ou código..."
                    className="pl-9"
                    value={buscaProduto}
                    onChange={(e) => setBuscaProduto(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {produtosFiltrados.slice(0, 60).map((p) => {
                    const noCarrinho = carrinho.find((i) => i.produto_id === p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => addItem(p.id)}
                        className={cn(
                          "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors hover:border-primary hover:bg-primary/5",
                          noCarrinho && "border-primary bg-primary/5",
                        )}
                      >
                        <p className="line-clamp-2 text-xs font-medium leading-tight">{p.nome}</p>
                        <div className="flex w-full items-center justify-between">
                          <span className="text-sm font-bold tnum">{formatCurrency(p.preco_venda)}</span>
                          {noCarrinho && (
                            <Badge variant="default" className="tnum px-1.5 py-0 text-[10px]">
                              {noCarrinho.quantidade}x
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                  {produtosFiltrados.length === 0 && (
                    <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                      Nenhum produto encontrado.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ---- Carrinho / ticket ---- */}
            <div className="flex flex-col overflow-hidden bg-muted/20">
              <div className="space-y-3 border-b p-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Cliente</Label>
                  <Select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                    <option value="">Consumidor final</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Vendedor</Label>
                    <Select value={vendedorId} onChange={(e) => setVendedorId(e.target.value)}>
                      <option value="">—</option>
                      {vendedores.map((v) => (
                        <option key={v.id} value={v.id}>{v.nome}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Pagamento</Label>
                    <Select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
                      <option value="">—</option>
                      <option>Dinheiro</option>
                      <option>PIX</option>
                      <option>Cartão de crédito</option>
                      <option>Cartão de débito</option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {carrinho.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 opacity-30" />
                    <p className="text-sm">Clique nos produtos ao lado para adicionar</p>
                  </div>
                )}
                <div className="space-y-2">
                  {carrinho.map((item) => (
                    <div key={item.produto_id} className="rounded-lg border bg-background p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-1 text-xs font-medium">{item.nome}</p>
                        <button onClick={() => removeItem(item.produto_id)} className="shrink-0 text-muted-foreground hover:text-destructive">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => alterarQtd(item.produto_id, -1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="tnum w-6 text-center text-sm">{item.quantidade}</span>
                          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => alterarQtd(item.produto_id, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="tnum text-sm font-semibold">
                          {formatCurrency(Number(item.precoUnit) * item.quantidade)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t bg-background p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="tnum text-2xl font-bold">{formatCurrency(totalCarrinho)}</span>
                </div>
                <Button className="w-full" size="lg" onClick={finalizar} disabled={createMut.isPending || carrinho.length === 0}>
                  Finalizar venda
                </Button>
                {carrinho.length > 0 && (
                  <Button variant="ghost" className="w-full" size="sm" onClick={() => setCarrinho([])}>
                    <Trash2 className="h-3.5 w-3.5" /> Limpar carrinho
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
