import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Page } from "@/lib/crud";

import type { Boleto, BoletoInput } from "./types";

export function useBoletos() {
  return useQuery({
    queryKey: ["boletos"],
    queryFn: async () => {
      const { data } = await api.get<Page<Boleto>>("/boletos", { params: { size: 100 } });
      return data;
    },
  });
}

export function useCreateBoleto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BoletoInput) => {
      const { data } = await api.post<Boleto>("/boletos", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boletos"] }),
  });
}

export function usePagarBoleto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<Boleto>(`/boletos/${id}/pagar`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boletos"] }),
  });
}
