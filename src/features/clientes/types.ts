export type TipoPessoa = "fisica" | "juridica";

export interface Cliente {
  id: number;
  tipo_pessoa: TipoPessoa;
  nome: string;
  nome_fantasia: string | null;
  documento: string | null;
  rg: string | null;
  inscricao_estadual: string | null;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  limite_credito: string;
  observacoes: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
