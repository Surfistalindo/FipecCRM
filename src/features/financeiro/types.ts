export type TipoConta = "receber" | "pagar";

export interface ContaFinanceira {
  id: number;
  tipo: TipoConta;
  descricao: string;
  contraparte: string | null;
  vencimento: string;
  valor: string;
  pago: boolean;
  data_pagamento: string | null;
  forma_pagamento: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}
