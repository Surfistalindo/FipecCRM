import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

import type { Compromisso, CompromissoInput } from "./types";

export function useCompromissos(params: { data_inicio?: string; data_fim?: string } = {}) {
  return useQuery({
    queryKey: ["compromissos", params],
    queryFn: async () => {
      const { data } = await api.get<Compromisso[]>("/agenda/compromissos", { params });
      return data;
    },
  });
}

export function useCreateCompromisso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CompromissoInput) => {
      const { data } = await api.post<Compromisso>("/agenda/compromissos", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["compromissos"] }),
  });
}
