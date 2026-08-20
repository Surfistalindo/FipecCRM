import { z } from "zod";

export const clienteSchema = z.object({
  tipo_pessoa: z.enum(["fisica", "juridica"]),
  nome: z.string().min(2, "Informe o nome").max(200),
  nome_fantasia: z.string().max(200).optional().or(z.literal("")),
  documento: z.string().optional().or(z.literal("")),
  rg: z.string().max(20).optional().or(z.literal("")),
  inscricao_estadual: z.string().max(20).optional().or(z.literal("")),
  email: z
    .string()
    .email("E-mail inválido")
    .optional()
    .or(z.literal("")),
  telefone: z.string().max(20).optional().or(z.literal("")),
  whatsapp: z.string().max(20).optional().or(z.literal("")),
  cep: z.string().max(9).optional().or(z.literal("")),
  logradouro: z.string().max(200).optional().or(z.literal("")),
  numero: z.string().max(20).optional().or(z.literal("")),
  complemento: z.string().max(100).optional().or(z.literal("")),
  bairro: z.string().max(100).optional().or(z.literal("")),
  cidade: z.string().max(100).optional().or(z.literal("")),
  uf: z.string().max(2).optional().or(z.literal("")),
  limite_credito: z.coerce.number().min(0),
  observacoes: z.string().optional().or(z.literal("")),
  ativo: z.boolean(),
});

export type ClienteFormValues = z.infer<typeof clienteSchema>;

/** Remove strings vazias para nao enviar "" ao backend. */
export function toPayload(values: ClienteFormValues) {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === "" || value === undefined) continue;
    out[key] = value;
  }
  return out;
}
