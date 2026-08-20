export interface Vendedor {
  id: number;
  nome: string;
  email: string | null;
  telefone: string | null;
  meta_mensal: string;
  comissao_pct: string;
  vendas_mes: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
