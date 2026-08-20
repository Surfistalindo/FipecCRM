export type TipoMovimento = "entrada" | "saida" | "transferencia" | "ajuste";

export interface MovimentoEstoque {
  id: number;
  produto: { id: number; nome: string; codigo: string | null };
  tipo: TipoMovimento;
  quantidade: string;
  origem: string | null;
  usuario: { id: number; name: string } | null;
  data: string;
}
