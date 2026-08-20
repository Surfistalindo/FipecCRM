import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

import type { Integracao } from "./types";

export function useIntegracoes() {
  return useQuery({
    queryKey: ["integracoes"],
    queryFn: async () => {
      const { data } = await api.get<Integracao[]>("/integracoes");
      return data;
    },
  });
}

export function useToggleIntegracao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (codigo: string) => {
      const { data } = await api.post<Integracao>(`/integracoes/${codigo}/toggle`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integracoes"] }),
  });
}
