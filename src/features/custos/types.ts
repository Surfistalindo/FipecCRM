export type CategoriaCustoFixo =
  | "aluguel"
  | "salarios"
  | "energia"
  | "agua"
  | "internet"
  | "impostos"
  | "marketing"
  | "manutencao"
  | "outros";

export interface CustoFixo {
  id: number;
  nome: string;
  categoria: CategoriaCustoFixo;
  valor_mensal: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustoFixoInput {
  nome: string;
  categoria: CategoriaCustoFixo;
  valor_mensal: string;
}

export interface CustoPorCategoria {
  categoria: string;
  total: string;
}

export interface RentabilidadeProduto {
  produto_id: number;
  produto: string;
  quantidade_vendida: string;
  receita: string;
  custo: string;
  margem: string;
  margem_pct: number | null;
}

export interface CustosResumo {
  total_custos_fixos_mes: string;
  custos_por_categoria: CustoPorCategoria[];
  receita_mes: string;
  custo_produtos_vendidos_mes: string;
  margem_bruta: string;
  margem_bruta_pct: number | null;
  margem_liquida: string;
  margem_liquida_pct: number | null;
  rentabilidade_produtos: RentabilidadeProduto[];
}
