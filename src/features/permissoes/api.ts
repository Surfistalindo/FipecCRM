import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

import type { Role } from "./types";

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data } = await api.get<Role[]>("/permissoes/roles");
      return data;
    },
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ nome, permissoes }: { nome: string; permissoes: Record<string, string[]> }) => {
      const { data } = await api.put<Role>(`/permissoes/roles/${nome}`, { permissoes });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
}
