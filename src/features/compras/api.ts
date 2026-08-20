import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Page } from "@/lib/crud";

import type { Compra, CompraItemInput, StatusCompra } from "./types";

export function useCompras(params: { size?: number; status?: StatusCompra } = {}) {
  return useQuery({
    queryKey: ["compras", params],
    queryFn: async () => {
      const { data } = await api.get<Page<Compra>>("/compras", { params });
      return data;
    },
  });
}

export function useCreateCompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      fornecedor_id?: number;
      observacoes?: string;
      status?: StatusCompra;
      itens: CompraItemInput[];
    }) => {
      const { data } = await api.post<Compra>("/compras", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["compras"] }),
  });
}

export function useReceberCompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<Compra>(`/compras/${id}/receber`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["compras"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
    },
  });
}

export function useCancelarCompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<Compra>(`/compras/${id}/cancelar`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["compras"] }),
  });
}
