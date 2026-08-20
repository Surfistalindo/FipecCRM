export type UnidadeMedida = "UN" | "CX" | "KG" | "LT" | "MT" | "PC" | "PAR";

export interface Produto {
  id: number;
  codigo: string | null;
  nome: string;
  descricao: string | null;
  marca: string | null;
  categoria: string | null;
  unidade: UnidadeMedida;
  ean: string | null;
  ncm: string | null;
  cest: string | null;
  preco_custo: string;
  preco_venda: string;
  preco_promocional: string | null;
  estoque: string;
  estoque_minimo: string;
  estoque_maximo: string | null;
  localizacao: string | null;
  peso_gramas: number | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
