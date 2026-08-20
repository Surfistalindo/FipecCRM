export interface Fornecedor {
  id: number;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string | null;
  inscricao_estadual: string | null;
  categoria: string | null;
  email: string | null;
  telefone: string | null;
  contato: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  prazo_entrega_dias: number | null;
  total_compras: string;
  avaliacao: number;
  observacoes: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
