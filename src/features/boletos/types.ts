export type StatusBoleto = "registrado" | "pago" | "vencido";

export interface Boleto {
  id: number;
  sacado: string;
  linha_digitavel: string;
  vencimento: string;
  valor: string;
  status: StatusBoleto;
  created_at: string;
  updated_at: string;
}

export interface BoletoInput {
  sacado: string;
  vencimento: string;
  valor: string;
}
