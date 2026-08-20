import {
  Building2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiErrorMessage } from "@/lib/api";
import { cn, formatCurrency, formatDocumento } from "@/lib/utils";

import { useClientes, useDeleteCliente } from "./api";
import { ClienteFormDialog } from "./cliente-form-dialog";
import type { Cliente } from "./types";

const PAGE_SIZE = 20;

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function ClientesPage() {
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selecionadoId, setSelecionadoId] = React.useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Cliente | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError } = useClientes({
    page,
    size: PAGE_SIZE,
    search: debounced || undefined,
  });
  const deleteMut = useDeleteCliente();

  const items = data?.items ?? [];
  const selecionado = items.find((c) => c.id === selecionadoId) ?? null;

  React.useEffect(() => {
    if (!selecionadoId && items.length > 0) setSelecionadoId(items[0].id);
  }, [items, selecionadoId]);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(cliente: Cliente) {
    setEditing(cliente);
    setDialogOpen(true);
  }

  async function handleDelete(cliente: Cliente) {
    if (!confirm(`Excluir o cliente "${cliente.nome}"?`)) return;
    try {
      await deleteMut.mutateAsync(cliente.id);
      if (selecionadoId === cliente.id) setSelecionadoId(null);
      toast.success("Cliente excluído");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível excluir"));
    }
  }

  const totalPages = data?.pages ?? 1;
  const enderecoCompleto = selecionado
    ? [
        selecionado.logradouro && selecionado.numero
          ? `${selecionado.logradouro}, ${selecionado.numero}`
          : selecionado.logradouro,
        selecionado.bairro,
        selecionado.cidade && selecionado.uf ? `${selecionado.cidade}/${selecionado.uf}` : selecionado.cidade,
        selecionado.cep,
      ]
        .filter(Boolean)
        .join(" — ")
    : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">Gerencie o cadastro de clientes da sua empresa.</p>
        </div>
        <Button onClick={openNew}>
          <Plus /> Novo cliente
        </Button>
      </div>

      <div className="grid grid-cols-1 overflow-hidden rounded-xl border shadow-sm lg:grid-cols-[360px_1fr]" style={{ minHeight: 560 }}>
        {/* ---- Coluna: lista de clientes ---- */}
        <div className="flex flex-col border-b bg-card lg:border-b-0 lg:border-r">
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, documento ou e-mail..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading && <p className="p-6 text-center text-sm text-muted-foreground">Carregando...</p>}
            {isError && <p className="p-6 text-center text-sm text-destructive">Erro ao carregar clientes.</p>}
            {!isLoading && items.length === 0 && (
              <p className="p-8 text-center text-sm text-muted-foreground">Nenhum cliente encontrado.</p>
            )}
            {items.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelecionadoId(c.id)}
                className={cn(
                  "flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50",
                  selecionadoId === c.id && "bg-primary/5",
                )}
              >
                <Avatar name={c.nome} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold">{c.nome}</span>
                    {!c.ativo && (
                      <Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-[10px]">
                        Inativo
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.cidade ? `${c.cidade}/${c.uf ?? ""}` : c.email || "Sem cidade informada"}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-semibold uppercase text-muted-foreground">
                  {c.tipo_pessoa === "juridica" ? "PJ" : "PF"}
                </span>
              </button>
            ))}
          </div>

          {data && data.total > 0 && (
            <div className="flex items-center justify-between border-t p-3 text-xs text-muted-foreground">
              <span>
                {data.total} cliente(s) · pág. {page}/{totalPages}
              </span>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ---- Painel: perfil do cliente ---- */}
        <div className="bg-background">
          {!selecionado && (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-24 text-muted-foreground">
              <User className="h-10 w-10 opacity-30" />
              <p className="text-sm">Selecione um cliente para ver o perfil</p>
            </div>
          )}
          {selecionado && (
            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
                <div className="flex items-center gap-4">
                  <Avatar name={selecionado.nome} className="h-14 w-14 text-lg" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">{selecionado.nome}</h2>
                      <Badge variant={selecionado.ativo ? "success" : "secondary"}>
                        {selecionado.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    {selecionado.nome_fantasia && (
                      <p className="text-sm text-muted-foreground">{selecionado.nome_fantasia}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {selecionado.tipo_pessoa === "juridica" ? "Pessoa Jurídica" : "Pessoa Física"} ·{" "}
                      {formatDocumento(selecionado.documento)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(selecionado)}>
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(selecionado)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-x-8 gap-y-1 pt-2 sm:grid-cols-2">
                <div>
                  <h3 className="pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Contato
                  </h3>
                  <InfoRow icon={Mail} label="E-mail" value={selecionado.email || "—"} />
                  <InfoRow icon={Phone} label="Telefone" value={selecionado.telefone || selecionado.whatsapp || "—"} />
                  <InfoRow icon={MapPin} label="Endereço" value={enderecoCompleto || "—"} />
                </div>
                <div>
                  <h3 className="pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Comercial
                  </h3>
                  <InfoRow icon={Wallet} label="Limite de crédito" value={formatCurrency(selecionado.limite_credito)} />
                  <InfoRow
                    icon={Building2}
                    label="Inscrição estadual"
                    value={selecionado.inscricao_estadual || "—"}
                  />
                  {selecionado.observacoes && <InfoRow icon={User} label="Observações" value={selecionado.observacoes} />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ClienteFormDialog open={dialogOpen} onOpenChange={setDialogOpen} cliente={editing} />
    </div>
  );
}
