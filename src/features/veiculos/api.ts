import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

import type { Veiculo, VeiculoInput } from "./types";

const KEY = ["equipamentos"];

export function useVeiculos() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data } = await api.get<Veiculo[]>("/equipamentos");
      return data;
    },
  });
}

export function useCreateVeiculo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: VeiculoInput) => {
      const { data } = await api.post<Veiculo>("/equipamentos", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteVeiculo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/equipamentos/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
