import { makeCrud } from "@/lib/crud";

import type { Usuario } from "./types";

export const { useList: useUsuarios, useCreate: useCreateUsuario, useUpdate: useUpdateUsuario } =
  makeCrud<Usuario>("usuarios");
