import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

import type { CobrancaPix, CobrancaPixInput } from "./types";

export function useCobrancasPix() {
  return useQuery({
    queryKey: ["cobrancas-pix"],
    queryFn: async () => {
      const { data } = await api.get<CobrancaPix[]>("/pix/cobrancas");
      return data;
    },
  });
}

export function useCreateCobrancaPix() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CobrancaPixInput) => {
      const { data } = await api.post<CobrancaPix>("/pix/cobrancas", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cobrancas-pix"] }),
  });
}
