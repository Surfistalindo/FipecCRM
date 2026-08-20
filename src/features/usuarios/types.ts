export interface Usuario {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  totp_enabled: boolean;
  role_nome: string | null;
  created_at: string;
}

export interface UsuarioCreateInput {
  name: string;
  email: string;
  password: string;
  role_nome?: string | null;
}

export interface UsuarioUpdateInput {
  name?: string;
  password?: string;
  is_active?: boolean;
  role_nome?: string | null;
}
