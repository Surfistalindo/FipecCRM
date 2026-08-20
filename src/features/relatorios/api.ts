import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

import type { RelatoriosResumo } from "./types";

export function useRelatoriosResumo() {
  return useQuery({
    queryKey: ["relatorios-resumo"],
    queryFn: async () => {
      const { data } = await api.get<RelatoriosResumo>("/relatorios/resumo");
      return data;
    },
  });
}
