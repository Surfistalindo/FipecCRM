export type TipoRegistroFiscal = "entrada" | "saida";

export interface RegistroFiscal {
  id: number;
  tipo: TipoRegistroFiscal;
  data: string;
  numero_nf: string;
  serie: string | null;
  cfop: string;
  participante_nome: string;
  participante_documento: string | null;
  valor_produtos: string;
  base_calculo_icms: string;
  aliquota_icms: string;
  valor_icms: string;
  base_calculo_ipi: string;
  aliquota_ipi: string;
  valor_ipi: string;
  valor_total: string;
  observacao: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegistroFiscalInput {
  tipo: TipoRegistroFiscal;
  data: string;
  numero_nf: string;
  serie?: string | null;
  cfop: string;
  participante_nome: string;
  participante_documento?: string | null;
  valor_produtos: number;
  base_calculo_icms: number;
  aliquota_icms: number;
  valor_icms: number;
  base_calculo_ipi: number;
  aliquota_ipi: number;
  valor_ipi: number;
  valor_total: number;
  observacao?: string | null;
}

export type SituacaoApuracao = "a_recolher" | "credor" | "zerado";

export interface ApuracaoImposto {
  mes_referencia: string;
  total_debitos: string;
  total_creditos: string;
  saldo: string;
  situacao: SituacaoApuracao;
}
