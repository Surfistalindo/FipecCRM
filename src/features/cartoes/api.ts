import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Page } from "@/lib/crud";

import type { StatusRecebivel, TransacaoCartao, TransacaoCartaoInput } from "./types";

export function useTransacoesCartao(params: { size?: number; status?: StatusRecebivel } = {}) {
  return useQuery({
    queryKey: ["cartoes", params],
    queryFn: async () => {
      const { data } = await api.get<Page<TransacaoCartao>>("/cartoes", { params });
      return data;
    },
  });
}

export function useCreateTransacaoCartao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TransacaoCartaoInput) => {
      const { data } = await api.post<TransacaoCartao>("/cartoes", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cartoes"] }),
  });
}

export function useMarcarRecebido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<TransacaoCartao>(`/cartoes/${id}/receber`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cartoes"] }),
  });
}
