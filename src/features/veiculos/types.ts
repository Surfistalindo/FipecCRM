export interface Veiculo {
  id: number;
  cliente_id: number;
  cliente: { id: number; nome: string };
  descricao: string;
  tipo: string | null;
  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;
  ano: string | null;
  placa: string | null;
  km_atual: number | null;
  created_at: string;
  updated_at: string;
}

export interface VeiculoInput {
  cliente_id: number;
  descricao: string;
  tipo?: string | null;
  marca?: string | null;
  modelo?: string | null;
  numero_serie?: string | null;
  ano?: string | null;
  placa?: string | null;
  km_atual?: number | null;
}
