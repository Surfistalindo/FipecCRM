export type SituacaoFuncionario = "Ativo" | "Férias" | "Afastado" | "Desligado";

export interface Funcionario {
  id: number;
  nome: string;
  cargo: string | null;
  departamento: string | null;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  admissao: string | null;
  salario: string;
  situacao: SituacaoFuncionario;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
