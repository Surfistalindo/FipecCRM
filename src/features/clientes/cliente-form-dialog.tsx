import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useCreateCliente, useUpdateCliente } from "./api";
import { type ClienteFormValues, clienteSchema, toPayload } from "./schema";
import type { Cliente } from "./types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente | null;
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function ClienteFormDialog({ open, onOpenChange, cliente }: Props) {
  const isEdit = Boolean(cliente);
  const createMut = useCreateCliente();
  const updateMut = useUpdateCliente();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: { tipo_pessoa: "fisica", ativo: true, limite_credito: 0 },
  });

  React.useEffect(() => {
    if (open) {
      reset(
        cliente
          ? {
              ...cliente,
              limite_credito: Number(cliente.limite_credito),
              nome_fantasia: cliente.nome_fantasia ?? "",
              documento: cliente.documento ?? "",
              rg: cliente.rg ?? "",
              inscricao_estadual: cliente.inscricao_estadual ?? "",
              email: cliente.email ?? "",
              telefone: cliente.telefone ?? "",
              whatsapp: cliente.whatsapp ?? "",
              cep: cliente.cep ?? "",
              logradouro: cliente.logradouro ?? "",
              numero: cliente.numero ?? "",
              complemento: cliente.complemento ?? "",
              bairro: cliente.bairro ?? "",
              cidade: cliente.cidade ?? "",
              uf: cliente.uf ?? "",
              observacoes: cliente.observacoes ?? "",
            }
          : { tipo_pessoa: "fisica", ativo: true, limite_credito: 0 },
      );
    }
  }, [open, cliente, reset]);

  const tipoPessoa = watch("tipo_pessoa");

  const onSubmit = handleSubmit(async (values) => {
    const payload = toPayload(values);
    try {
      if (isEdit && cliente) {
        await updateMut.mutateAsync({ id: cliente.id, payload });
        toast.success("Cliente atualizado com sucesso");
      } else {
        await createMut.mutateAsync(payload);
        toast.success("Cliente cadastrado com sucesso");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível salvar o cliente"));
    }
  });

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar cliente" : "Novo cliente"}</DialogTitle>
          <DialogDescription>
            Preencha os dados do cliente. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Tipo de pessoa *">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("tipo_pessoa")}
              >
                <option value="fisica">Pessoa Física</option>
                <option value="juridica">Pessoa Jurídica</option>
              </select>
            </Field>
            <Field
              label={tipoPessoa === "juridica" ? "CNPJ" : "CPF"}
              error={errors.documento?.message}
            >
              <Input
                placeholder={tipoPessoa === "juridica" ? "00.000.000/0000-00" : "000.000.000-00"}
                {...register("documento")}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nome / Razão social *" error={errors.nome?.message}>
              <Input {...register("nome")} />
            </Field>
            <Field label="Nome fantasia">
              <Input {...register("nome_fantasia")} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="RG">
              <Input {...register("rg")} />
            </Field>
            <Field label="Inscrição estadual">
              <Input {...register("inscricao_estadual")} />
            </Field>
            <Field label="Limite de crédito" error={errors.limite_credito?.message}>
              <Input type="number" step="0.01" min="0" {...register("limite_credito")} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="E-mail" error={errors.email?.message}>
              <Input type="email" {...register("email")} />
            </Field>
            <Field label="Telefone">
              <Input {...register("telefone")} />
            </Field>
            <Field label="WhatsApp">
              <Input {...register("whatsapp")} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Field label="CEP">
              <Input {...register("cep")} />
            </Field>
            <Field label="Logradouro" className="sm:col-span-2">
              <Input {...register("logradouro")} />
            </Field>
            <Field label="Número">
              <Input {...register("numero")} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Field label="Bairro">
              <Input {...register("bairro")} />
            </Field>
            <Field label="Cidade" className="sm:col-span-2">
              <Input {...register("cidade")} />
            </Field>
            <Field label="UF">
              <Input maxLength={2} {...register("uf")} />
            </Field>
          </div>

          <Field label="Observações">
            <textarea
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register("observacoes")}
            />
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input"
              checked={watch("ativo")}
              onChange={(e) => setValue("ativo", e.target.checked)}
            />
            Cliente ativo
          </label>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
