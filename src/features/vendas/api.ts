import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Page } from "@/lib/crud";

import type { StatusVenda, Venda, VendaItemInput } from "./types";

export function useVendas(params: { size?: number; status?: StatusVenda } = {}) {
  return useQuery({
    queryKey: ["vendas", params],
    queryFn: async () => {
      const { data } = await api.get<Page<Venda>>("/vendas", { params });
      return data;
    },
  });
}

export function useCreateVenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      cliente_id?: number;
      vendedor_id?: number;
      forma_pagamento?: string;
      desconto?: string;
      observacoes?: string;
      itens: VendaItemInput[];
    }) => {
      const { data } = await api.post<Venda>("/vendas", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendas"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
    },
  });
}

export function useEmitirNF() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<Venda>(`/vendas/${id}/emitir-nf`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendas"] }),
  });
}

export function useAvancarSituacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<Venda>(`/vendas/${id}/avancar-situacao`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendas"] }),
  });
}

export function useCancelarVenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<Venda>(`/vendas/${id}/cancelar`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendas"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
    },
  });
}
