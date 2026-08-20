import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Page } from "@/lib/crud";

import type { ContaFinanceira, TipoConta } from "./types";

export function useContas(params: { size?: number; tipo?: TipoConta; pago?: boolean } = {}) {
  return useQuery({
    queryKey: ["financeiro-contas", params],
    queryFn: async () => {
      const { data } = await api.get<Page<ContaFinanceira>>("/financeiro/contas", { params });
      return data;
    },
  });
}

export function useCreateConta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      tipo: TipoConta;
      descricao: string;
      contraparte?: string;
      vencimento: string;
      valor: string;
    }) => {
      const { data } = await api.post<ContaFinanceira>("/financeiro/contas", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financeiro-contas"] }),
  });
}

export function useBaixarConta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, forma_pagamento }: { id: number; forma_pagamento?: string }) => {
      const { data } = await api.post<ContaFinanceira>(`/financeiro/contas/${id}/baixar`, {
        forma_pagamento,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financeiro-contas"] }),
  });
}
