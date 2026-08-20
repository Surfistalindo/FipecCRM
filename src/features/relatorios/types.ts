export interface VendaPeriodoItem {
  mes: string;
  label: string;
  total: string;
}

export interface VendaCidadeItem {
  cidade: string;
  uf: string | null;
  total: string;
  pedidos: number;
}

export interface ProdutoVendidoItem {
  produto_id: number;
  produto: string;
  quantidade: string;
  total: string;
}

export interface VendedorRankingItem {
  vendedor_id: number;
  nome: string;
  pedidos: number;
  total: string;
}

export interface ClienteRankingItem {
  cliente_id: number;
  nome: string;
  compras: number;
  total: string;
}

export interface ClienteInativoItem {
  cliente_id: number;
  nome: string;
  ultima_compra: string | null;
  dias_inativo: number | null;
  total_historico: string;
}

export interface FormaPagamentoItem {
  forma: string;
  total: string;
}

export interface FechamentoDia {
  data: string;
  total_vendas: string;
  numero_vendas: number;
  ticket_medio: string;
  total_cancelamentos: string;
  formas_pagamento: FormaPagamentoItem[];
}

export interface RelatoriosResumo {
  vendas_por_periodo: VendaPeriodoItem[];
  vendas_por_cidade: VendaCidadeItem[];
  produtos_mais_vendidos: ProdutoVendidoItem[];
  vendedores_ranking: VendedorRankingItem[];
  clientes_ranking: ClienteRankingItem[];
  clientes_inativos: ClienteInativoItem[];
  fechamento_dia: FechamentoDia;
}
