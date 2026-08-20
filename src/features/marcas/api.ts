import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

import type { Marca, MarcaInput } from "./types";

const KEY = ["marcas"];

export function useMarcas() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data } = await api.get<Marca[]>("/marcas");
      return data;
    },
  });
}

export function useCreateMarca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: MarcaInput) => {
      const { data } = await api.post<Marca>("/marcas", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteMarca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/marcas/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
