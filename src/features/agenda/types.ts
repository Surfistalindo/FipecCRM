export interface Compromisso {
  id: number;
  titulo: string;
  data: string;
  hora: string;
  cor: string;
  created_at: string;
  updated_at: string;
}

export interface CompromissoInput {
  titulo: string;
  data: string;
  hora: string;
  cor?: string;
}
