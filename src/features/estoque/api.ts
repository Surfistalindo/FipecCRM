import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Page } from "@/lib/crud";

import type { MovimentoEstoque, TipoMovimento } from "./types";

export function useMovimentos(params: { size?: number; produto_id?: number; tipo?: TipoMovimento } = {}) {
  return useQuery({
    queryKey: ["estoque-movimentos", params],
    queryFn: async () => {
      const { data } = await api.get<Page<MovimentoEstoque>>("/estoque/movimentos", { params });
      return data;
    },
  });
}

export function useCreateMovimento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      produto_id: number;
      tipo: TipoMovimento;
      quantidade: string;
      origem?: string;
    }) => {
      const { data } = await api.post<MovimentoEstoque>("/estoque/movimentos", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estoque-movimentos"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
    },
  });
}
