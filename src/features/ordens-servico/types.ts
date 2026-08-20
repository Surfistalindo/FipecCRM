export type StatusOS =
  | "aberta"
  | "em_andamento"
  | "aguardando_peca"
  | "concluida"
  | "entregue"
  | "cancelada";

export interface Equipamento {
  id: number;
  cliente_id: number;
  cliente: { id: number; nome: string };
  descricao: string;
  tipo: string | null;
  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;
  ano: string | null;
  created_at: string;
  updated_at: string;
}

export interface EquipamentoInput {
  cliente_id: number;
  descricao: string;
  tipo?: string;
  marca?: string;
  modelo?: string;
  numero_serie?: string;
  ano?: string;
}

export interface OrdemServicoItem {
  id: number;
  produto: { id: number; nome: string; codigo: string | null };
  quantidade: string;
  preco_unit: string;
  subtotal: string;
}

export interface OrdemServicoAnexo {
  id: number;
  nome: string;
  url: string;
  created_at: string;
}

export interface OrdemServicoHistoricoItem {
  id: number;
  status_anterior: StatusOS | null;
  status_novo: StatusOS;
  observacao: string | null;
  usuario: { id: number; name: string } | null;
  data: string;
}

export interface OrdemServico {
  id: number;
  numero: string | null;
  cliente: { id: number; nome: string };
  equipamento: { id: number; descricao: string; marca: string | null; modelo: string | null } | null;
  tecnico: { id: number; nome: string } | null;
  status: StatusOS;
  descricao_problema: string;
  diagnostico: string | null;
  observacoes: string | null;
  data_abertura: string;
  data_previsao: string | null;
  data_conclusao: string | null;
  valor_mao_obra: string;
  valor_pecas: string;
  desconto: string;
  total: string;
  assinatura_base64: string | null;
  assinatura_em: string | null;
  itens: OrdemServicoItem[];
  anexos: OrdemServicoAnexo[];
  historico: OrdemServicoHistoricoItem[];
  created_at: string;
  updated_at: string;
}

export interface OrdemServicoCreateInput {
  cliente_id: number;
  equipamento_id?: number;
  tecnico_id?: number;
  descricao_problema: string;
  data_previsao?: string;
  valor_mao_obra?: string;
  observacoes?: string;
}

export interface OrdemServicoUpdateInput {
  equipamento_id?: number | null;
  tecnico_id?: number | null;
  descricao_problema?: string;
  diagnostico?: string;
  observacoes?: string;
  data_previsao?: string;
  valor_mao_obra?: string;
  desconto?: string;
}

export interface OrdemServicoItemInput {
  produto_id: number;
  quantidade: string;
  preco_unit?: string;
}
