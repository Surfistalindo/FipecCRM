export type AcaoLog = "login" | "criar" | "editar" | "excluir";

export interface LogAcesso {
  id: number;
  usuario_nome: string;
  acao: AcaoLog;
  descricao: string;
  ip: string | null;
  created_at: string;
}
