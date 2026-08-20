export type TipoCheque = "recebido" | "emitido";
export type StatusCheque = "em_carteira" | "depositado" | "compensado" | "devolvido";

export interface Cheque {
  id: number;
  tipo: TipoCheque;
  numero: string;
  banco: string | null;
  pessoa: string | null;
  valor: string;
  bom_para: string;
  status: StatusCheque;
  created_at: string;
  updated_at: string;
}

export interface ChequeInput {
  tipo: TipoCheque;
  numero: string;
  banco?: string;
  pessoa?: string;
  valor: string;
  bom_para: string;
}
