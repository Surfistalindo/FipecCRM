export type StatusOrcamento = "aberto" | "aprovado" | "convertido" | "recusado";

export interface OrcamentoItem {
  id: number;
  produto: { id: number; nome: string; codigo: string | null };
  quantidade: string;
  preco_unit: string;
  subtotal: string;
}

export interface Orcamento {
  id: number;
  numero: string | null;
  cliente: { id: number; nome: string } | null;
  data: string;
  validade: string | null;
  status: StatusOrcamento;
  total: string;
  observacoes: string | null;
  venda_id: number | null;
  itens: OrcamentoItem[];
  created_at: string;
  updated_at: string;
}

export interface OrcamentoItemInput {
  produto_id: number;
  quantidade: string;
  preco_unit?: string;
}
