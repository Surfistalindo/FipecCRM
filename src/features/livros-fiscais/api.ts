import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

import type { ApuracaoImposto, RegistroFiscal, RegistroFiscalInput, TipoRegistroFiscal } from "./types";

const REGISTROS_KEY = ["livros-fiscais-registros"];

export function useRegistrosFiscais(tipo: TipoRegistroFiscal) {
  return useQuery({
    queryKey: [...REGISTROS_KEY, tipo],
    queryFn: async () => {
      const { data } = await api.get<RegistroFiscal[]>("/livros-fiscais/registros", { params: { tipo } });
      return data;
    },
  });
}

export function useCreateRegistroFiscal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RegistroFiscalInput) => {
      const { data } = await api.post<RegistroFiscal>("/livros-fiscais/registros", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: REGISTROS_KEY }),
  });
}

export function useDeleteRegistroFiscal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/livros-fiscais/registros/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: REGISTROS_KEY }),
  });
}

export function useApuracaoIcms(mesReferencia: string) {
  return useQuery({
    queryKey: ["livros-fiscais-apuracao-icms", mesReferencia],
    queryFn: async () => {
      const { data } = await api.get<ApuracaoImposto>("/livros-fiscais/apuracao-icms", {
        params: { mes_referencia: mesReferencia },
      });
      return data;
    },
    enabled: Boolean(mesReferencia),
  });
}

export function useApuracaoIpi(mesReferencia: string) {
  return useQuery({
    queryKey: ["livros-fiscais-apuracao-ipi", mesReferencia],
    queryFn: async () => {
      const { data } = await api.get<ApuracaoImposto>("/livros-fiscais/apuracao-ipi", {
        params: { mes_referencia: mesReferencia },
      });
      return data;
    },
    enabled: Boolean(mesReferencia),
  });
}
