export type StatusConsignacao = "aberta" | "acertada";

export interface Consignacao {
  id: number;
  cliente: string;
  produto: string;
  quantidade_enviada: number;
  quantidade_vendida: number;
  quantidade_devolvida: number;
  quantidade_em_poder: number;
  valor_unitario: string;
  data: string;
  status: StatusConsignacao;
  created_at: string;
  updated_at: string;
}

export interface ConsignacaoInput {
  cliente: string;
  produto: string;
  quantidade_enviada: number;
  valor_unitario: string;
  data: string;
}
