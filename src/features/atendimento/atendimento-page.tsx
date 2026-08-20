import {
  CheckCircle2,
  Clock,
  Headset,
  Loader2,
  Lock,
  Plus,
  Send,
  Star,
  Trash2,
} from "lucide-react";
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
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useClientes } from "@/features/clientes/api";
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

import {
  useAdicionarMensagem,
  useAvaliarChamado,
  useChamados,
  useContagemStatus,
  useCreateChamado,
  useDeleteChamado,
  useMudarStatusChamado,
} from "./api";
import type { CanalChamado, CategoriaChamado, Chamado, PrioridadeChamado, StatusChamado } from "./types";

const STATUS_LABEL: Record<StatusChamado, string> = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  aguardando_cliente: "Aguardando cliente",
  resolvido: "Resolvido",
  fechado: "Fechado",
};

const STATUS_DOT: Record<StatusChamado, string> = {
  aberto: "bg-sky-500",
  em_andamento: "bg-amber-500",
  aguardando_cliente: "bg-violet-500",
  resolvido: "bg-success",
  fechado: "bg-muted-foreground",
};

const PRIORIDADE_LABEL: Record<PrioridadeChamado, string> = {
  baixa: "Baixa",
  normal: "Normal",
  alta: "Alta",
  urgente: "Urgente",
};

const PRIORIDADE_VARIANT: Record<PrioridadeChamado, "secondary" | "default" | "warning" | "destructive"> = {
  baixa: "secondary",
  normal: "default",
  alta: "warning",
  urgente: "destructive",
};

const CATEGORIA_LABEL: Record<CategoriaChamado, string> = {
  duvida: "Dúvida",
  reclamacao: "Reclamação",
  suporte_tecnico: "Suporte técnico",
  financeiro: "Financeiro",
  garantia: "Garantia",
  outro: "Outro",
};

const CANAL_LABEL: Record<CanalChamado, string> = {
  telefone: "Telefone",
  whatsapp: "WhatsApp",
  email: "E-mail",
  presencial: "Presencial",
  chat: "Chat",
};

const FILTROS: { value: StatusChamado | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "aberto", label: "Abertos" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "aguardando_cliente", label: "Aguardando" },
  { value: "resolvido", label: "Resolvidos" },
  { value: "fechado", label: "Fechados" },
];

function tempoRelativo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const EMPTY_FORM = {
  cliente_id: "",
  assunto: "",
  descricao: "",
  categoria: "outro" as CategoriaChamado,
  canal: "chat" as CanalChamado,
  prioridade: "normal" as PrioridadeChamado,
};

export function AtendimentoPage() {
  const { data: chamados = [], isLoading } = useChamados();
  const { data: contagem } = useContagemStatus();
  const { data: clientesPage } = useClientes({ page: 1, size: 200 });
  const createMut = useCreateChamado();
  const statusMut = useMudarStatusChamado();
  const mensagemMut = useAdicionarMensagem();
  const avaliarMut = useAvaliarChamado();
  const deleteMut = useDeleteChamado();

  const [filtro, setFiltro] = React.useState<StatusChamado | "todos">("todos");
  const [selecionadoId, setSelecionadoId] = React.useState<number | null>(null);
  const [novaMensagem, setNovaMensagem] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY_FORM);
  const threadRef = React.useRef<HTMLDivElement>(null);

  const clientes = clientesPage?.items ?? [];

  const filtrados = filtro === "todos" ? chamados : chamados.filter((c) => c.status === filtro);
  const selecionado = chamados.find((c) => c.id === selecionadoId) ?? null;

  React.useEffect(() => {
    if (!selecionadoId && filtrados.length > 0) setSelecionadoId(filtrados[0].id);
  }, [filtrados, selecionadoId]);

  React.useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [selecionado?.mensagens.length]);

  async function salvarChamado() {
    if (!form.cliente_id || !form.assunto.trim() || !form.descricao.trim()) {
      toast.error("Preencha cliente, assunto e descrição");
      return;
    }
    try {
      const criado = await createMut.mutateAsync({
        cliente_id: Number(form.cliente_id),
        assunto: form.assunto.trim(),
        descricao: form.descricao.trim(),
        categoria: form.categoria,
        canal: form.canal,
        prioridade: form.prioridade,
      });
      toast.success("Chamado aberto");
      setForm(EMPTY_FORM);
      setOpen(false);
      setSelecionadoId(criado.id);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível abrir o chamado"));
    }
  }

  async function enviarMensagem() {
    if (!selecionado || !novaMensagem.trim()) return;
    try {
      await mensagemMut.mutateAsync({ id: selecionado.id, mensagem: novaMensagem.trim(), autor_tipo: "atendente" });
      setNovaMensagem("");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível enviar a mensagem"));
    }
  }

  async function mudarStatus(status: StatusChamado) {
    if (!selecionado) return;
    try {
      await statusMut.mutateAsync({ id: selecionado.id, status });
      toast.success(`Chamado marcado como "${STATUS_LABEL[status]}"`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível mudar o status"));
    }
  }

  async function avaliar(nota: number) {
    if (!selecionado) return;
    try {
      await avaliarMut.mutateAsync({ id: selecionado.id, avaliacao: nota });
      toast.success("Avaliação registrada");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível avaliar"));
    }
  }

  async function remover(chamado: Chamado) {
    try {
      await deleteMut.mutateAsync(chamado.id);
      if (selecionadoId === chamado.id) setSelecionadoId(null);
      toast.success("Chamado removido");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível remover"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        path="/atendimento"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus /> Novo chamado
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Abertos" value={contagem?.aberto ?? 0} icon={Headset} tone="warning" />
        <StatCard label="Em andamento" value={contagem?.em_andamento ?? 0} icon={Clock} />
        <StatCard label="Aguardando cliente" value={contagem?.aguardando_cliente ?? 0} icon={Loader2} />
        <StatCard label="Resolvidos" value={contagem?.resolvido ?? 0} icon={CheckCircle2} tone="success" />
      </div>

      <div className="grid grid-cols-1 overflow-hidden rounded-xl border shadow-sm lg:grid-cols-[340px_1fr]" style={{ height: "calc(100vh - 21rem)", minHeight: 480 }}>
        {/* ---- Coluna: lista de chamados ---- */}
        <div className="flex flex-col border-b bg-card lg:border-b-0 lg:border-r">
          <div className="flex gap-1 overflow-x-auto border-b p-2">
            {FILTROS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFiltro(f.value)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  filtro === f.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading && <p className="p-6 text-center text-sm text-muted-foreground">Carregando...</p>}
            {!isLoading && filtrados.length === 0 && (
              <p className="p-8 text-center text-sm text-muted-foreground">Nenhum chamado nesse filtro.</p>
            )}
            {filtrados.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelecionadoId(c.id)}
                className={cn(
                  "flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50",
                  selecionadoId === c.id && "bg-primary/5",
                )}
              >
                <Avatar name={c.cliente.nome} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{c.cliente.nome}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{tempoRelativo(c.updated_at)}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{c.assunto}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[c.status])} />
                    <span className="text-[11px] text-muted-foreground">{STATUS_LABEL[c.status]}</span>
                    {c.prioridade === "urgente" && (
                      <Badge variant="destructive" className="ml-auto px-1.5 py-0 text-[10px]">
                        Urgente
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ---- Painel: conversa ---- */}
        <div className="flex flex-col bg-background">
          {!selecionado && (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Headset className="h-10 w-10 opacity-30" />
              <p className="text-sm">Selecione um chamado para ver a conversa</p>
            </div>
          )}
          {selecionado && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={selecionado.cliente.nome} />
                  <div>
                    <p className="text-sm font-semibold">
                      {selecionado.cliente.nome} <span className="text-muted-foreground">· {selecionado.numero}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{selecionado.assunto}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{CATEGORIA_LABEL[selecionado.categoria]}</Badge>
                  <Badge variant="outline">{CANAL_LABEL[selecionado.canal]}</Badge>
                  <Badge variant={PRIORIDADE_VARIANT[selecionado.prioridade]}>
                    {PRIORIDADE_LABEL[selecionado.prioridade]}
                  </Badge>
                  <Button size="icon" variant="ghost" onClick={() => remover(selecionado)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div ref={threadRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">{selecionado.descricao}</div>
                {selecionado.mensagens.map((m) => (
                  <div
                    key={m.id}
                    className={cn("flex gap-2", m.autor_tipo === "atendente" ? "flex-row-reverse" : "flex-row")}
                  >
                    <Avatar name={m.autor_nome} className="h-7 w-7 text-[10px]" />
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                        m.autor_tipo === "atendente"
                          ? "rounded-tr-sm bg-primary text-primary-foreground"
                          : "rounded-tl-sm bg-muted",
                      )}
                    >
                      <p>{m.mensagem}</p>
                      <p
                        className={cn(
                          "mt-1 text-[10px] opacity-70",
                          m.autor_tipo === "atendente" ? "text-primary-foreground" : "text-muted-foreground",
                        )}
                      >
                        {m.autor_nome} · {tempoRelativo(m.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {selecionado.status !== "fechado" && (
                    <>
                      {selecionado.status !== "aguardando_cliente" && (
                        <Button size="sm" variant="outline" onClick={() => mudarStatus("aguardando_cliente")}>
                          <Clock className="h-3.5 w-3.5" /> Aguardar cliente
                        </Button>
                      )}
                      {selecionado.status !== "resolvido" && (
                        <Button size="sm" variant="outline" onClick={() => mudarStatus("resolvido")}>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Marcar resolvido
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => mudarStatus("fechado")}>
                        <Lock className="h-3.5 w-3.5" /> Fechar chamado
                      </Button>
                    </>
                  )}
                  {(selecionado.status === "resolvido" || selecionado.status === "fechado") && (
                    <div className="ml-auto flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Avaliação:</span>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => avaliar(n)}>
                          <Star
                            className={cn(
                              "h-4 w-4",
                              (selecionado.avaliacao ?? 0) >= n
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground",
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selecionado.status !== "fechado" && (
                  <div className="flex items-end gap-2">
                    <Textarea
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      placeholder="Escreva uma resposta..."
                      className="min-h-[44px] flex-1 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          enviarMensagem();
                        }
                      }}
                    />
                    <Button size="icon" onClick={enviarMensagem} disabled={mensagemMut.isPending}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo chamado</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Cliente *</Label>
              <Select value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}>
                <option value="">Selecione...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Assunto *</Label>
              <Input value={form.assunto} onChange={(e) => setForm({ ...form, assunto: e.target.value })} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Descrição *</Label>
              <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value as CategoriaChamado })}>
                {Object.entries(CATEGORIA_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Canal</Label>
              <Select value={form.canal} onChange={(e) => setForm({ ...form, canal: e.target.value as CanalChamado })}>
                {Object.entries(CANAL_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Prioridade</Label>
              <Select value={form.prioridade} onChange={(e) => setForm({ ...form, prioridade: e.target.value as PrioridadeChamado })}>
                {Object.entries(PRIORIDADE_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarChamado} disabled={createMut.isPending}>
              Abrir chamado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
