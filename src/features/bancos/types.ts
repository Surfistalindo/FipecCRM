export type TipoContaBancaria = "corrente" | "poupanca";

export type TipoMovimentoBancario =
  | "deposito"
  | "saque"
  | "pix"
  | "ted"
  | "tarifa"
  | "transferencia_entrada"
  | "transferencia_saida";

export interface ContaBancaria {
  id: number;
  banco: string;
  agencia: string;
  conta: string;
  tipo_conta: TipoContaBancaria;
  saldo: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContaBancariaInput {
  banco: string;
  agencia: string;
  conta: string;
  tipo_conta: TipoContaBancaria;
  saldo_inicial: string;
}

export interface MovimentoBancario {
  id: number;
  conta_bancaria_id: number;
  tipo: TipoMovimentoBancario;
  descricao: string;
  valor: string;
  data: string;
}

export interface MovimentoBancarioInput {
  conta_bancaria_id: number;
  tipo: TipoMovimentoBancario;
  descricao: string;
  valor: string;
}

export interface TransferenciaInput {
  conta_origem_id: number;
  conta_destino_id: number;
  valor: string;
  descricao?: string;
}
