import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "@/lib/api";

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ListParams {
  page?: number;
  size?: number;
  search?: string;
  [key: string]: unknown;
}

/**
 * Fabrica de hooks CRUD para um recurso REST paginado (mesmo contrato do
 * modulo Clientes: GET lista paginada, POST, PUT/:id, DELETE/:id).
 */
export function makeCrud<T extends { id: number }>(resource: string) {
  const rootKey = [resource];

  function useList(params: ListParams = {}) {
    return useQuery({
      queryKey: [resource, params],
      queryFn: async () => {
        const { data } = await api.get<Page<T>>(`/${resource}`, { params });
        return data;
      },
    });
  }

  function useCreate() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (payload: Record<string, unknown>) => {
        const { data } = await api.post<T>(`/${resource}`, payload);
        return data;
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: rootKey }),
    });
  }

  function useUpdate() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async ({
        id,
        payload,
      }: {
        id: number;
        payload: Record<string, unknown>;
      }) => {
        const { data } = await api.put<T>(`/${resource}/${id}`, payload);
        return data;
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: rootKey }),
    });
  }

  function useRemove() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (id: number) => {
        await api.delete(`/${resource}/${id}`);
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: rootKey }),
    });
  }

  return { useList, useCreate, useUpdate, useRemove };
}
