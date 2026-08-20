export interface CobrancaPix {
  id: number;
  descricao: string;
  valor: string;
  paga: boolean;
  created_at: string;
  updated_at: string;
}

export interface CobrancaPixInput {
  descricao: string;
  valor: string;
}
