import {
  ArrowLeft,
  Check,
  ChevronRight,
  FileSignature,
  LogIn,
  Paperclip,
  Pencil,
  Plus,
  Printer,
  ShoppingCart,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

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
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProdutos } from "@/features/produtos/api";
import { apiErrorMessage } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn, formatCurrency } from "@/lib/utils";

import {
  useAdicionarAnexoOS,
  useAdicionarItemOS,
  useAssinarOS,
  useMudarStatusOS,
  useOrdemServico,
  useRemoverAnexoOS,
  useRemoverItemOS,
  useUpdateOrdemServico,
} from "./api";
import { SignaturePad } from "./signature-pad";
import type { StatusOS } from "./types";

const STATUS_META: Record<StatusOS, { label: string; variant: "default" | "success" | "secondary" | "destructive" | "warning" }> = {
  aberta: { label: "Aberta", variant: "secondary" },
  em_andamento: { label: "Em andamento", variant: "default" },
  aguardando_peca: { label: "Aguardando peça", variant: "warning" },
  concluida: { label: "Concluída", variant: "success" },
  entregue: { label: "Entregue", variant: "success" },
  cancelada: { label: "Cancelada", variant: "destructive" },
};

const PROXIMOS_STATUS: Record<StatusOS, { status: StatusOS; label: string }[]> = {
  aberta: [{ status: "em_andamento", label: "Iniciar atendimento" }],
  em_andamento: [
    { status: "aguardando_peca", label: "Aguardar peça" },
    { status: "concluida", label: "Concluir OS" },
  ],
  aguardando_peca: [{ status: "em_andamento", label: "Retomar atendimento" }],
  concluida: [{ status: "entregue", label: "Marcar como entregue" }],
  entregue: [],
  cancelada: [],
};

export function OrdemServicoDetalhePage() {
  const { id } = useParams();
  const osId = Number(id);
  const navigate = useNavigate();

  const [openItem, setOpenItem] = React.useState(false);
  const [openAnexo, setOpenAnexo] = React.useState(false);
  const [openDiagnostico, setOpenDiagnostico] = React.useState(false);
  const [formItem, setFormItem] = React.useState({ produto_id: "", quantidade: "1" });
  const [formAnexo, setFormAnexo] = React.useState({ nome: "", url: "" });
  const [diagnostico, setDiagnostico] = React.useState("");

  const { data: ordem, isLoading } = useOrdemServico(osId);
  const { data: produtosData } = useProdutos({ size: 200 });
  const mudarStatusMut = useMudarStatusOS();
  const adicionarItemMut = useAdicionarItemOS();
  const removerItemMut = useRemoverItemOS();
  const adicionarAnexoMut = useAdicionarAnexoOS();
  const removerAnexoMut = useRemoverAnexoOS();
  const assinarMut = useAssinarOS();
  const updateMut = useUpdateOrdemServico();

  const produtos = produtosData?.items ?? [];

  React.useEffect(() => {
    if (ordem) setDiagnostico(ordem.diagnostico ?? "");
  }, [ordem]);

  if (isLoading || !ordem) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Carregando...</div>;
  }

  async function mudarStatus(status: StatusOS) {
    try {
      await mudarStatusMut.mutateAsync({ id: osId, status });
      toast.success("Status atualizado");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível mudar o status"));
    }
  }

  async function cancelar() {
    if (!window.confirm("Cancelar esta ordem de serviço?")) return;
    await mudarStatus("cancelada");
  }

  async function adicionarItem() {
    if (!formItem.produto_id) {
      toast.error("Selecione o produto");
      return;
    }
    try {
      await adicionarItemMut.mutateAsync({
        id: osId,
        payload: { produto_id: Number(formItem.produto_id), quantidade: formItem.quantidade },
      });
      toast.success("Peça adicionada");
      setFormItem({ produto_id: "", quantidade: "1" });
      setOpenItem(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível adicionar"));
    }
  }

  async function removerItem(itemId: number) {
    try {
      await removerItemMut.mutateAsync({ id: osId, itemId });
      toast.success("Peça removida e estoque estornado");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível remover"));
    }
  }

  async function adicionarAnexo() {
    if (!formAnexo.nome || !formAnexo.url) {
      toast.error("Preencha nome e link do anexo");
      return;
    }
    try {
      await adicionarAnexoMut.mutateAsync({ id: osId, ...formAnexo });
      toast.success("Anexo adicionado");
      setFormAnexo({ nome: "", url: "" });
      setOpenAnexo(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível adicionar"));
    }
  }

  async function salvarDiagnostico() {
    try {
      await updateMut.mutateAsync({ id: osId, payload: { diagnostico } });
      toast.success("Diagnóstico salvo");
      setOpenDiagnostico(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível salvar"));
    }
  }

  async function salvarAssinatura(base64: string) {
    try {
      await assinarMut.mutateAsync({ id: osId, assinatura_base64: base64 });
      toast.success("Assinatura registrada");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível salvar a assinatura"));
    }
  }

  const meta = STATUS_META[ordem.status];
  const podeEditar = !["concluida", "entregue", "cancelada"].includes(ordem.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <nav className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Link to="/ordens-servico" className="hover:text-foreground">Ordens de Serviço</Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            <span className="text-foreground">{ordem.numero}</span>
          </nav>
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" onClick={() => navigate("/ordens-servico")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{ordem.numero}</h1>
            <Badge variant={meta.variant}>{meta.label}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Imprimir
          </Button>
          {PROXIMOS_STATUS[ordem.status].map((p) => (
            <Button key={p.status} onClick={() => mudarStatus(p.status)} disabled={mudarStatusMut.isPending}>
              <Check className="h-4 w-4" /> {p.label}
            </Button>
          ))}
          {podeEditar && (
            <Button variant="outline" className="text-destructive" onClick={cancelar}>
              <X className="h-4 w-4" /> Cancelar OS
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" /> Dados da OS</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Cliente</p>
              <p className="text-sm font-medium">{ordem.cliente.nome}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Equipamento</p>
              <p className="text-sm font-medium">{ordem.equipamento?.descricao ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Técnico responsável</p>
              <p className="text-sm font-medium">{ordem.tecnico?.nome ?? "A definir"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Abertura / Previsão</p>
              <p className="text-sm font-medium">
                {formatDate(ordem.data_abertura)}
                {ordem.data_previsao ? ` · previsão ${formatDate(ordem.data_previsao)}` : ""}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Descrição do problema</p>
              <p className="text-sm">{ordem.descricao_problema}</p>
            </div>
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Diagnóstico técnico</p>
                {podeEditar && (
                  <Button size="sm" variant="ghost" onClick={() => setOpenDiagnostico(true)}>
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </Button>
                )}
              </div>
              <p className="text-sm">{ordem.diagnostico || "Ainda não informado."}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Resumo financeiro</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Mão de obra</span><span className="tnum">{formatCurrency(ordem.valor_mao_obra)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Peças</span><span className="tnum">{formatCurrency(ordem.valor_pecas)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Desconto</span><span className="tnum">-{formatCurrency(ordem.desconto)}</span></div>
            <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total</span><span className="tnum">{formatCurrency(ordem.total)}</span></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-primary" /> Peças utilizadas</CardTitle>
          {podeEditar && (
            <Button size="sm" variant="outline" className="print:hidden" onClick={() => setOpenItem(true)}>
              <Plus className="h-3.5 w-3.5" /> Adicionar peça
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-1.5">
          {ordem.itens.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-muted/40">
              <span>{item.quantidade}x {item.produto.nome}</span>
              <div className="flex items-center gap-3">
                <span className="tnum text-muted-foreground">{formatCurrency(item.subtotal)}</span>
                {podeEditar && (
                  <button onClick={() => removerItem(item.id)} className="print:hidden text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {ordem.itens.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma peça lançada</p>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="print:hidden">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2"><Paperclip className="h-4 w-4 text-primary" /> Anexos</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setOpenAnexo(true)}>
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {ordem.anexos.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-muted/40">
                <a href={a.url} target="_blank" rel="noreferrer" className="truncate text-primary hover:underline">{a.nome}</a>
                <button onClick={() => removerAnexoMut.mutate({ id: osId, anexoId: a.id })} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {ordem.anexos.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Nenhum anexo</p>}
          </CardContent>
        </Card>

        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LogIn className="h-4 w-4 text-primary" /> Histórico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ordem.historico.map((h) => (
              <div key={h.id} className="flex items-start gap-2 text-sm">
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", STATUS_META[h.status_novo].variant === "destructive" ? "bg-destructive" : "bg-primary")} />
                <div>
                  <p>
                    {h.status_anterior ? `${STATUS_META[h.status_anterior].label} → ` : "Criada em "}
                    <strong>{STATUS_META[h.status_novo].label}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(h.data)} {h.usuario ? `· ${h.usuario.name}` : ""}
                  </p>
                  {h.observacao && <p className="text-xs italic text-muted-foreground">{h.observacao}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileSignature className="h-4 w-4 text-primary" /> Assinatura do cliente</CardTitle>
        </CardHeader>
        <CardContent>
          {ordem.assinatura_base64 ? (
            <div className="space-y-2">
              <img src={ordem.assinatura_base64} alt="Assinatura do cliente" className="h-32 rounded-lg border bg-white" />
              <p className="text-xs text-muted-foreground">
                Assinado em {ordem.assinatura_em ? formatDateTime(ordem.assinatura_em) : "—"}
              </p>
            </div>
          ) : ["concluida", "entregue"].includes(ordem.status) ? (
            <div className="print:hidden">
              <SignaturePad onSave={salvarAssinatura} saving={assinarMut.isPending} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Disponível após a OS ser concluída.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Adicionar peca */}
      <Dialog open={openItem} onOpenChange={setOpenItem}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar peça</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Produto *</Label>
              <Select value={formItem.produto_id} onChange={(e) => setFormItem({ ...formItem, produto_id: e.target.value })}>
                <option value="">Selecione</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome} — {formatCurrency(p.preco_venda)}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Quantidade *</Label>
              <Input type="number" min={1} value={formItem.quantidade} onChange={(e) => setFormItem({ ...formItem, quantidade: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenItem(false)}>Cancelar</Button>
            <Button onClick={adicionarItem} disabled={adicionarItemMut.isPending}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adicionar anexo */}
      <Dialog open={openAnexo} onOpenChange={setOpenAnexo}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar anexo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input value={formAnexo.nome} onChange={(e) => setFormAnexo({ ...formAnexo, nome: e.target.value })} placeholder="Foto do equipamento" />
            </div>
            <div className="space-y-1.5">
              <Label>Link *</Label>
              <Input value={formAnexo.url} onChange={(e) => setFormAnexo({ ...formAnexo, url: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAnexo(false)}>Cancelar</Button>
            <Button onClick={adicionarAnexo} disabled={adicionarAnexoMut.isPending}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editar diagnostico */}
      <Dialog open={openDiagnostico} onOpenChange={setOpenDiagnostico}>
        <DialogContent>
          <DialogHeader><DialogTitle>Diagnóstico técnico</DialogTitle></DialogHeader>
          <Textarea value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} rows={6} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDiagnostico(false)}>Cancelar</Button>
            <Button onClick={salvarDiagnostico} disabled={updateMut.isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
