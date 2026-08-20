export type TipoImpressoraEtiqueta = "termica" | "laser" | "jato_de_tinta";

export interface EtiquetaModelo {
  id: number;
  nome: string;
  largura_mm: number;
  altura_mm: number;
  tipo_impressora: TipoImpressoraEtiqueta;
  mostrar_codigo_barras: boolean;
  mostrar_preco: boolean;
  mostrar_descricao: boolean;
  mostrar_marca: boolean;
  padrao: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface EtiquetaModeloInput {
  nome: string;
  largura_mm: number;
  altura_mm: number;
  tipo_impressora: TipoImpressoraEtiqueta;
  mostrar_codigo_barras: boolean;
  mostrar_preco: boolean;
  mostrar_descricao: boolean;
  mostrar_marca: boolean;
}

export type TipoAjusteTabelaPreco = "acrescimo" | "desconto";

export interface TabelaPreco {
  id: number;
  nome: string;
  tipo_ajuste: TipoAjusteTabelaPreco;
  percentual: string;
  padrao: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface TabelaPrecoInput {
  nome: string;
  tipo_ajuste: TipoAjusteTabelaPreco;
  percentual: number;
}

export interface CondicaoPagamento {
  id: number;
  nome: string;
  parcelas: number;
  intervalo_dias: number;
  desconto_a_vista_pct: string;
  juros_atraso_pct_mes: string;
  multa_atraso_pct: string;
  padrao: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CondicaoPagamentoInput {
  nome: string;
  parcelas: number;
  intervalo_dias: number;
  desconto_a_vista_pct: number;
  juros_atraso_pct_mes: number;
  multa_atraso_pct: number;
}
