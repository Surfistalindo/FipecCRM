export interface Transportadora {
  id: number;
  razao_social: string;
  cnpj: string | null;
  cidade: string | null;
  uf: string | null;
  regioes: string | null;
  contato: string | null;
  email: string | null;
  prazo_medio_dias: number;
  frete_minimo: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
