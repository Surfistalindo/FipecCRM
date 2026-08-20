export type StatusCaixa = "aberto" | "fechado";
export type TipoMovimentoCaixa = "venda" | "suprimento" | "sangria" | "estorno_venda";

export interface MovimentoCaixa {
  id: number;
  tipo: TipoMovimentoCaixa;
  descricao: string;
  valor: string;
  venda_id: number | null;
  usuario: { id: number; name: string } | null;
  data: string;
}

export interface CaixaSessao {
  id: number;
  status: StatusCaixa;
  saldo_abertura: string;
  saldo_fechamento: string | null;
  aberto_em: string;
  fechado_em: string | null;
  usuario_abertura: { id: number; name: string } | null;
  movimentos: MovimentoCaixa[];
  saldo_atual: string;
}
