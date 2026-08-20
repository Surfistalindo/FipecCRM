export type StatusVenda = "aberta" | "finalizada" | "cancelada";
export type StatusNF = "pendente" | "emitida" | "autorizada";
export type SituacaoEntrega = "novo" | "separacao" | "faturado" | "entregue";

export interface VendaItem {
  id: number;
  produto: { id: number; nome: string; codigo: string | null };
  quantidade: string;
  preco_unit: string;
  subtotal: string;
}

export interface Venda {
  id: number;
  numero: string | null;
  cliente: { id: number; nome: string } | null;
  vendedor: { id: number; nome: string } | null;
  data: string;
  status: StatusVenda;
  nf_status: StatusNF;
  situacao_entrega: SituacaoEntrega;
  forma_pagamento: string | null;
  desconto: string;
  total: string;
  observacoes: string | null;
  itens: VendaItem[];
  created_at: string;
  updated_at: string;
}

export interface VendaItemInput {
  produto_id: number;
  quantidade: string;
  preco_unit?: string;
}
