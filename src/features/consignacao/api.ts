import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Page } from "@/lib/crud";

import type { Consignacao, ConsignacaoInput } from "./types";

export function useConsignacoes(params: { size?: number } = {}) {
  return useQuery({
    queryKey: ["consignacoes", params],
    queryFn: async () => {
      const { data } = await api.get<Page<Consignacao>>("/consignacoes", { params });
      return data;
    },
  });
}

export function useCreateConsignacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ConsignacaoInput) => {
      const { data } = await api.post<Consignacao>("/consignacoes", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["consignacoes"] }),
  });
}

export function useAcertarConsignacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      quantidade_vendida,
      quantidade_devolvida,
    }: {
      id: number;
      quantidade_vendida: number;
      quantidade_devolvida: number;
    }) => {
      const { data } = await api.post<Consignacao>(`/consignacoes/${id}/acertar`, {
        quantidade_vendida,
        quantidade_devolvida,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["consignacoes"] }),
  });
}
