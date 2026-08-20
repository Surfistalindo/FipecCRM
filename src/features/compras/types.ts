export type StatusCompra = "cotacao" | "pedido" | "recebido" | "cancelado";

export interface CompraItem {
  id: number;
  produto: { id: number; nome: string; codigo: string | null };
  quantidade: string;
  preco_unit: string;
  subtotal: string;
}

export interface Compra {
  id: number;
  numero: string | null;
  fornecedor: { id: number; razao_social: string } | null;
  data: string;
  status: StatusCompra;
  total: string;
  observacoes: string | null;
  itens: CompraItem[];
  created_at: string;
  updated_at: string;
}

export interface CompraItemInput {
  produto_id: number;
  quantidade: string;
  preco_unit?: string;
}
