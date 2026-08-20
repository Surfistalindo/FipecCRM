export type BandeiraCartao = "visa" | "mastercard" | "elo" | "amex" | "hipercard";
export type StatusRecebivel = "a_receber" | "recebido";

export interface TransacaoCartao {
  id: number;
  data: string;
  bandeira: BandeiraCartao;
  adquirente: string | null;
  parcelas: number;
  valor_bruto: string;
  taxa_pct: string;
  valor_liquido: string;
  previsao_recebimento: string;
  status: StatusRecebivel;
  created_at: string;
  updated_at: string;
}

export interface TransacaoCartaoInput {
  data: string;
  bandeira: BandeiraCartao;
  adquirente?: string;
  parcelas: number;
  valor_bruto: string;
  taxa_pct: string;
  previsao_recebimento: string;
}
