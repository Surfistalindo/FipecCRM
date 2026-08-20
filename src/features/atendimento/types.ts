export type CategoriaChamado = "duvida" | "reclamacao" | "suporte_tecnico" | "financeiro" | "garantia" | "outro";
export type CanalChamado = "telefone" | "whatsapp" | "email" | "presencial" | "chat";
export type PrioridadeChamado = "baixa" | "normal" | "alta" | "urgente";
export type StatusChamado = "aberto" | "em_andamento" | "aguardando_cliente" | "resolvido" | "fechado";
export type AutorMensagem = "cliente" | "atendente";

export interface ChamadoMensagem {
  id: number;
  autor_tipo: AutorMensagem;
  autor_nome: string;
  mensagem: string;
  created_at: string;
}

export interface Chamado {
  id: number;
  numero: string | null;
  cliente_id: number;
  cliente: { id: number; nome: string };
  responsavel_id: number | null;
  responsavel: { id: number; nome: string } | null;
  assunto: string;
  descricao: string;
  categoria: CategoriaChamado;
  canal: CanalChamado;
  prioridade: PrioridadeChamado;
  status: StatusChamado;
  avaliacao: number | null;
  fechado_em: string | null;
  mensagens: ChamadoMensagem[];
  created_at: string;
  updated_at: string;
}

export interface ChamadoInput {
  cliente_id: number;
  responsavel_id?: number | null;
  assunto: string;
  descricao: string;
  categoria: CategoriaChamado;
  canal: CanalChamado;
  prioridade: PrioridadeChamado;
}
