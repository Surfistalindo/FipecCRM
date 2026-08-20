import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

import type { DashboardResumo } from "./types";

export function useDashboardResumo() {
  return useQuery({
    queryKey: ["dashboard-resumo"],
    queryFn: async () => {
      const { data } = await api.get<DashboardResumo>("/dashboard/resumo");
      return data;
    },
    staleTime: 60_000,
  });
}
