export interface Marca {
  id: number;
  nome: string;
  cor: string | null;
  ativo: boolean;
  produtos_count: number;
  created_at: string;
  updated_at: string;
}

export interface MarcaInput {
  nome: string;
  cor: string | null;
}
