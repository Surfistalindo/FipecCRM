import { Check, Copy, FileText, Plus, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader, StatCard } from "@/components/page-header";
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
import { useClientes } from "@/features/clientes/api";
import { useProdutos } from "@/features/produtos/api";
import { apiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { formatCurrency } from "@/lib/utils";
import {
  useAprovarOrcamento,
  useConverterOrcamento,
  useCreateOrcamento,
  useDuplicarOrcamento,
  useOrcamentos,
} from "./api";
import type { OrcamentoItemInput, StatusOrcamento } from "./types";

const STATUS_META: Record<StatusOrcamento, { label: string; variant: "default" | "success" | "secondary" | "destructive" }> = {
  aberto: { label: "Em aberto", variant: "default" },
  aprovado: { label: "Aprovado", variant: "success" },
  convertido: { label: "Convertido em venda", variant: "secondary" },
  recusado: { label: "Recusado", variant: "destructive" },
};

interface LinhaCarrinho extends OrcamentoItemInput {
  nome: string;
  precoSugerido: string;
}

export function OrcamentosPage() {
  const [open, setOpen] = React.useState(false);
  const [clienteId, setClienteId] = React.useState("");
  const [validade, setValidade] = React.useState("");
  const [produtoSel, setProdutoSel] = React.useState("");
  const [qtdSel, setQtdSel] = React.useState("1");
  const [carrinho, setCarrinho] = React.useState<LinhaCarrinho[]>([]);

  const { data } = useOrcamentos({ size: 30 });
  const { data: clientesData } = useClientes({ page: 1, size: 100 });
  const { data: produtosData } = useProdutos({ size: 200 });
  const createMut = useCreateOrcamento();
  const aprovarMut = useAprovarOrcamento();
  const converterMut = useConverterOrcamento();
  const duplicarMut = useDuplicarOrcamento();

  const items = data?.items ?? [];
  const clientes = clientesData?.items ?? [];
  const produtos = produtosData?.items ?? [];

  const abertos = items.filter((o) => o.status === "aberto").length;
  const total = items.reduce((a, o) => a + Number(o.total), 0);
  const convertidos = items.filter((o) => o.status === "convertido").length;
  const taxaConversao = items.length ? Math.round((convertidos / items.length) * 100) : 0;

  function addItem() {
    const produto = produtos.find((p) => p.id === Number(produtoSel));
    if (!produto) return toast.error("Selecione um produto");
    const qtd = Number(qtdSel);
    if (!qtd || qtd <= 0) return toast.error("Quantidade inválida");
    setCarrinho((prev) => [
      ...prev,
      { produto_id: produto.id, quantidade: qtdSel, nome: produto.nome, precoSugerido: produto.preco_venda },
    ]);
    setProdutoSel("");
    setQtdSel("1");
  }

  function removeItem(idx: number) {
    setCarrinho((prev) => prev.filter((_, i) => i !== idx));
  }

  const totalCarrinho = carrinho.reduce((a, i) => a + Number(i.precoSugerido) * Number(i.quantidade), 0);

  function resetForm() {
    setClienteId("");
    setValidade("");
    setCarrinho([]);
  }

  async function save() {
    if (carrinho.length === 0) return toast.error("Adicione ao menos um item");
    try {
      await createMut.mutateAsync({
        cliente_id: clienteId ? Number(clienteId) : undefined,
        validade: validade || undefined,
        itens: carrinho.map((c) => ({ produto_id: c.produto_id, quantidade: c.quantidade })),
      });
      toast.success("Orçamento criado");
      resetForm();
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível salvar"));
    }
  }

  async function aprovar(id: number) {
    try {
      await aprovarMut.mutateAsync(id);
      toast.success("Orçamento aprovado");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível aprovar"));
    }
  }

  async function converter(id: number) {
    try {
      await converterMut.mutateAsync(id);
      toast.success("Orçamento convertido em venda");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível converter"));
    }
  }

  async function duplicar(id: number) {
    try {
      await duplicarMut.mutateAsync(id);
      toast.success("Orçamento duplicado");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível duplicar"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader path="/orcamentos" actions={<Button onClick={() => setOpen(true)}><Plus /> Novo orçamento</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Orçamentos em aberto" value={abertos} icon={FileText} tone="warning" />
        <StatCard label="Valor total" value={formatCurrency(total)} icon={FileText} />
        <StatCard label="Taxa de conversão" value={`${taxaConversao}%`} icon={Check} tone="success" />
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">Nenhum orçamento cadastrado.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((o) => (
            <div key={o.id} className="flex flex-col rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-sm font-semibold">{o.numero}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{o.cliente?.nome ?? "Consumidor final"}</p>
                </div>
                <Badge variant={STATUS_META[o.status].variant}>{STATUS_META[o.status].label}</Badge>
              </div>
              <div className="my-4 text-2xl font-bold">{formatCurrency(o.total)}</div>
              <div className="mb-4 flex justify-between text-xs text-muted-foreground">
                <span>Emitido {formatDate(o.data)}</span>
                {o.validade && <span>Válido até {formatDate(o.validade)}</span>}
              </div>
              <div className="mt-auto flex flex-wrap gap-2">
                {o.status === "aberto" && (
                  <Button size="sm" variant="outline" onClick={() => aprovar(o.id)}>Aprovar</Button>
                )}
                {(o.status === "aberto" || o.status === "aprovado") && (
                  <Button size="sm" onClick={() => converter(o.id)}><Check className="h-3.5 w-3.5" /> Converter</Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => duplicar(o.id)}><Copy className="h-3.5 w-3.5" /> Duplicar</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Novo orçamento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Cliente</Label>
                <Select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                  <option value="">Consumidor final</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Validade</Label>
                <Input type="date" value={validade} onChange={(e) => setValidade(e.target.value)} />
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <Label className="mb-2 block">Adicionar item</Label>
              <div className="flex gap-2">
                <Select className="flex-1" value={produtoSel} onChange={(e) => setProdutoSel(e.target.value)}>
                  <option value="">Selecione o produto</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome} — {formatCurrency(p.preco_venda)}</option>
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
            <Button onClick={save} disabled={createMut.isPending}>Salvar orçamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
