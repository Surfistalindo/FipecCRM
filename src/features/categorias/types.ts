export interface Categoria {
  id: number;
  nome: string;
  categoria_pai_id: number | null;
  ativo: boolean;
  produtos_count: number;
  created_at: string;
  updated_at: string;
}

export interface CategoriaInput {
  nome: string;
  categoria_pai_id: number | null;
}

export interface CategoriaNode extends Categoria {
  filhos: CategoriaNode[];
}
