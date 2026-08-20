import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

import type { CustoFixo, CustoFixoInput, CustosResumo } from "./types";

export function useCustosFixos() {
  return useQuery({
    queryKey: ["custos-fixos"],
    queryFn: async () => {
      const { data } = await api.get<CustoFixo[]>("/custos/fixos");
      return data;
    },
  });
}

export function useCreateCustoFixo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CustoFixoInput) => {
      const { data } = await api.post<CustoFixo>("/custos/fixos", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["custos-fixos"] });
      qc.invalidateQueries({ queryKey: ["custos-resumo"] });
    },
  });
}

export function useDeleteCustoFixo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/custos/fixos/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["custos-fixos"] });
      qc.invalidateQueries({ queryKey: ["custos-resumo"] });
    },
  });
}

export function useCustosResumo() {
  return useQuery({
    queryKey: ["custos-resumo"],
    queryFn: async () => {
      const { data } = await api.get<CustosResumo>("/custos/resumo");
      return data;
    },
  });
}
