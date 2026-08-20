export interface Role {
  nome: string;
  permissoes: Record<string, string[]>;
}
