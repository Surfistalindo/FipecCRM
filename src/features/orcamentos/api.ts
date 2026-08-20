import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Page } from "@/lib/crud";

import type { Orcamento, OrcamentoItemInput } from "./types";

export function useOrcamentos(params: { size?: number } = {}) {
  return useQuery({
    queryKey: ["orcamentos", params],
    queryFn: async () => {
      const { data } = await api.get<Page<Orcamento>>("/orcamentos", { params });
      return data;
    },
  });
}

export function useCreateOrcamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      cliente_id?: number;
      validade?: string;
      itens: OrcamentoItemInput[];
    }) => {
      const { data } = await api.post<Orcamento>("/orcamentos", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orcamentos"] }),
  });
}

function useAction(action: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<Orcamento>(`/orcamentos/${id}/${action}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orcamentos"] });
      if (action === "converter") qc.invalidateQueries({ queryKey: ["vendas"] });
    },
  });
}

export const useAprovarOrcamento = () => useAction("aprovar");
export const useConverterOrcamento = () => useAction("converter");
export const useDuplicarOrcamento = () => useAction("duplicar");
