import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Page } from "@/lib/crud";

import type { Cheque, ChequeInput, StatusCheque, TipoCheque } from "./types";

export function useCheques(params: { size?: number; tipo?: TipoCheque; status?: StatusCheque } = {}) {
  return useQuery({
    queryKey: ["cheques", params],
    queryFn: async () => {
      const { data } = await api.get<Page<Cheque>>("/cheques", { params });
      return data;
    },
  });
}

export function useCreateCheque() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ChequeInput) => {
      const { data } = await api.post<Cheque>("/cheques", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cheques"] }),
  });
}

export function useMudarStatusCheque() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: StatusCheque }) => {
      const { data } = await api.post<Cheque>(`/cheques/${id}/status/${status}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cheques"] }),
  });
}
