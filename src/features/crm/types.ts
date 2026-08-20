export type EtapaOportunidade = "lead" | "contato" | "proposta" | "ganho" | "perdido";

export interface Oportunidade {
  id: number;
  empresa: string;
  responsavel: string | null;
  valor: string;
  etapa: EtapaOportunidade;
  created_at: string;
  updated_at: string;
}

export interface OportunidadeInput {
  empresa: string;
  responsavel?: string;
  valor: string;
}
