import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

import type { CaixaSessao, TipoMovimentoCaixa } from "./types";

export function useCaixaAtual() {
  return useQuery({
    queryKey: ["caixa-atual"],
    queryFn: async () => {
      const { data } = await api.get<CaixaSessao | null>("/caixa/atual");
      return data;
    },
  });
}

export function useAbrirCaixa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (saldo_abertura: string) => {
      const { data } = await api.post<CaixaSessao>("/caixa/abrir", { saldo_abertura });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["caixa-atual"] }),
  });
}

export function useFecharCaixa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<CaixaSessao>("/caixa/fechar");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["caixa-atual"] }),
  });
}

export function useRegistrarMovimentoCaixa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { tipo: TipoMovimentoCaixa; descricao: string; valor: string }) => {
      const { data } = await api.post<CaixaSessao>("/caixa/movimentos", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["caixa-atual"] }),
  });
}
