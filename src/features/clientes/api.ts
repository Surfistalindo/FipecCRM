import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Cliente, Page } from "./types";

export interface ListParams {
  page: number;
  size: number;
  search?: string;
  ativo?: boolean;
}

export function useClientes(params: ListParams) {
  return useQuery({
    queryKey: ["clientes", params],
    queryFn: async () => {
      const { data } = await api.get<Page<Cliente>>("/clientes", { params });
      return data;
    },
  });
}

export function useCreateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post<Cliente>("/clientes", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });
}

export function useUpdateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: Record<string, unknown>;
    }) => {
      const { data } = await api.put<Cliente>(`/clientes/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });
}

export function useDeleteCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/clientes/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });
}
