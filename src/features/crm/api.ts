import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Page } from "@/lib/crud";

import type { Oportunidade, OportunidadeInput } from "./types";

export function useOportunidades() {
  return useQuery({
    queryKey: ["crm-oportunidades"],
    queryFn: async () => {
      const { data } = await api.get<Page<Oportunidade>>("/crm/oportunidades", { params: { size: 100 } });
      return data;
    },
  });
}

export function useCreateOportunidade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: OportunidadeInput) => {
      const { data } = await api.post<Oportunidade>("/crm/oportunidades", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm-oportunidades"] }),
  });
}

export function useAvancarOportunidade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<Oportunidade>(`/crm/oportunidades/${id}/avancar`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm-oportunidades"] }),
  });
}
