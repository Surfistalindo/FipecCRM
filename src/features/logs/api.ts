import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

import type { LogAcesso } from "./types";

export function useLogs() {
  return useQuery({
    queryKey: ["logs"],
    queryFn: async () => {
      const { data } = await api.get<LogAcesso[]>("/logs");
      return data;
    },
  });
}
