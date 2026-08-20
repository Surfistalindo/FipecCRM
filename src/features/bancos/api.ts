import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Page } from "@/lib/crud";

import type {
  ContaBancaria,
  ContaBancariaInput,
  MovimentoBancario,
  MovimentoBancarioInput,
  TransferenciaInput,
} from "./types";

export function useContasBancarias() {
  return useQuery({
    queryKey: ["contas-bancarias"],
    queryFn: async () => {
      const { data } = await api.get<ContaBancaria[]>("/bancos/contas");
      return data;
    },
  });
}

export function useCreateContaBancaria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ContaBancariaInput) => {
      const { data } = await api.post<ContaBancaria>("/bancos/contas", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contas-bancarias"] }),
  });
}

export function useExtrato(contaId: number | null) {
  return useQuery({
    queryKey: ["extrato-bancario", contaId],
    queryFn: async () => {
      const { data } = await api.get<Page<MovimentoBancario>>(`/bancos/contas/${contaId}/extrato`);
      return data;
    },
    enabled: contaId !== null,
  });
}

export function useRegistrarMovimentoBancario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: MovimentoBancarioInput) => {
      const { data } = await api.post<MovimentoBancario>("/bancos/movimentos", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contas-bancarias"] });
      qc.invalidateQueries({ queryKey: ["extrato-bancario"] });
    },
  });
}

export function useTransferir() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TransferenciaInput) => {
      const { data } = await api.post<MovimentoBancario[]>("/bancos/transferencia", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contas-bancarias"] });
      qc.invalidateQueries({ queryKey: ["extrato-bancario"] });
    },
  });
}
