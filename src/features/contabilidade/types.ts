export type TipoConta = "ativo" | "passivo" | "patrimonio_liquido" | "receita" | "despesa";
export type NaturezaConta = "devedora" | "credora";

export interface PlanoConta {
  id: number;
  codigo: string;
  nome: string;
  tipo: TipoConta;
  natureza: NaturezaConta;
  conta_pai_id: number | null;
  aceita_lancamento: boolean;
  ativo: boolean;
  saldo_atual: string;
  created_at: string;
  updated_at: string;
}

export interface PlanoContaNode extends PlanoConta {
  filhos: PlanoContaNode[];
}

export interface PlanoContaInput {
  codigo: string;
  nome: string;
  tipo: TipoConta;
  natureza: NaturezaConta;
  conta_pai_id: number | null;
  aceita_lancamento: boolean;
}

export interface CentroCusto {
  id: number;
  codigo: string;
  nome: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CentroCustoInput {
  codigo: string;
  nome: string;
}

export type TipoPartida = "debito" | "credito";
export type StatusLancamento = "lancado" | "estornado";

export interface PartidaInput {
  conta_id: number;
  centro_custo_id: number | null;
  tipo: TipoPartida;
  valor: number;
}

export interface PartidaRead {
  id: number;
  conta: { id: number; codigo: string; nome: string };
  centro_custo: { id: number; codigo: string; nome: string } | null;
  tipo: TipoPartida;
  valor: string;
}

export interface LancamentoContabil {
  id: number;
  numero: string | null;
  data: string;
  historico: string;
  status: StatusLancamento;
  valor_total: string;
  partidas: PartidaRead[];
  created_at: string;
  updated_at: string;
}

export interface LancamentoContabilInput {
  data: string;
  historico: string;
  partidas: PartidaInput[];
}

export interface RazaoLinha {
  data: string;
  lancamento_id: number;
  lancamento_numero: string | null;
  historico: string;
  debito: string;
  credito: string;
  saldo_acumulado: string;
}

export interface RazaoResumo {
  conta: { id: number; codigo: string; nome: string };
  saldo_anterior: string;
  linhas: RazaoLinha[];
  saldo_final: string;
}

export interface BalanceteLinha {
  conta_id: number;
  codigo: string;
  nome: string;
  tipo: TipoConta;
  natureza: NaturezaConta;
  total_debito: string;
  total_credito: string;
  saldo: string;
}

export interface BalanceteResumo {
  data_fim: string;
  linhas: BalanceteLinha[];
  total_debito: string;
  total_credito: string;
}
