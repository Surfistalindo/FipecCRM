export interface DashboardKPIs {
  receita_mes: string;
  receita_mes_anterior: string;
  variacao_receita_pct: number | null;
  vendas_mes: number;
  vendas_mes_anterior: number;
  variacao_vendas_pct: number | null;
  ticket_medio: string;
  clientes_ativos: number;
  novos_clientes_mes: number;
  produtos_estoque_baixo: number;
  contas_a_receber_pendentes: string;
  contas_a_pagar_pendentes: string;
}

export interface FluxoCaixaPonto {
  data: string;
  entradas: string;
  saidas: string;
}

export interface ProdutoRanking {
  produto_id: number;
  produto: string;
  quantidade: string;
  valor: string;
}

export interface VendedorRanking {
  vendedor_id: number;
  vendedor: string;
  total: string;
  meta: string;
}

export interface FormaPagamentoFatia {
  forma: string;
  total: string;
}

export interface ContaVencendo {
  id: number;
  descricao: string;
  tipo: "receber" | "pagar";
  valor: string;
  vencimento: string;
}

export interface DashboardResumo {
  kpis: DashboardKPIs;
  fluxo_caixa: FluxoCaixaPonto[];
  produtos_mais_vendidos: ProdutoRanking[];
  vendedores_ranking: VendedorRanking[];
  vendas_por_forma_pagamento: FormaPagamentoFatia[];
  contas_a_vencer: ContaVencendo[];
}
