import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

import type {
  BalanceteResumo,
  CentroCusto,
  CentroCustoInput,
  LancamentoContabil,
  LancamentoContabilInput,
  PlanoConta,
  PlanoContaInput,
  RazaoResumo,
} from "./types";

/* ---------------------------------------------------------- Plano de contas */

const PLANO_CONTAS_KEY = ["contabilidade-plano-contas"];

export function usePlanoContas() {
  return useQuery({
    queryKey: PLANO_CONTAS_KEY,
    queryFn: async () => {
      const { data } = await api.get<PlanoConta[]>("/contabilidade/plano-contas");
      return data;
    },
  });
}

export function useCreatePlanoConta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PlanoContaInput) => {
      const { data } = await api.post<PlanoConta>("/contabilidade/plano-contas", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PLANO_CONTAS_KEY }),
  });
}

export function useDeletePlanoConta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/contabilidade/plano-contas/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PLANO_CONTAS_KEY }),
  });
}

/* ----------------------------------------------------------- Centros de custo */

const CENTROS_CUSTO_KEY = ["contabilidade-centros-custo"];

export function useCentrosCusto() {
  return useQuery({
    queryKey: CENTROS_CUSTO_KEY,
    queryFn: async () => {
      const { data } = await api.get<CentroCusto[]>("/contabilidade/centros-custo");
      return data;
    },
  });
}

export function useCreateCentroCusto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CentroCustoInput) => {
      const { data } = await api.post<CentroCusto>("/contabilidade/centros-custo", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CENTROS_CUSTO_KEY }),
  });
}

export function useDeleteCentroCusto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/contabilidade/centros-custo/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CENTROS_CUSTO_KEY }),
  });
}

/* --------------------------------------------------------------- Lancamentos */

const LANCAMENTOS_KEY = ["contabilidade-lancamentos"];

export function useLancamentos() {
  return useQuery({
    queryKey: LANCAMENTOS_KEY,
    queryFn: async () => {
      const { data } = await api.get<LancamentoContabil[]>("/contabilidade/lancamentos");
      return data;
    },
  });
}

export function useCreateLancamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: LancamentoContabilInput) => {
      const { data } = await api.post<LancamentoContabil>("/contabilidade/lancamentos", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LANCAMENTOS_KEY });
      qc.invalidateQueries({ queryKey: PLANO_CONTAS_KEY });
    },
  });
}

export function useEstornarLancamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<LancamentoContabil>(`/contabilidade/lancamentos/${id}/estornar`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LANCAMENTOS_KEY });
      qc.invalidateQueries({ queryKey: PLANO_CONTAS_KEY });
    },
  });
}

export function useDeleteLancamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/contabilidade/lancamentos/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LANCAMENTOS_KEY });
      qc.invalidateQueries({ queryKey: PLANO_CONTAS_KEY });
    },
  });
}

/* ---------------------------------------------------------------- Razao */

export function useRazao(contaId: number | null, dataInicio?: string, dataFim?: string) {
  return useQuery({
    queryKey: ["contabilidade-razao", contaId, dataInicio, dataFim],
    queryFn: async () => {
      const { data } = await api.get<RazaoResumo>("/contabilidade/razao", {
        params: { conta_id: contaId, data_inicio: dataInicio, data_fim: dataFim },
      });
      return data;
    },
    enabled: contaId !== null,
  });
}

/* ------------------------------------------------------------- Balancete */

export function useBalancete(dataFim: string) {
  return useQuery({
    queryKey: ["contabilidade-balancete", dataFim],
    queryFn: async () => {
      const { data } = await api.get<BalanceteResumo>("/contabilidade/balancete", {
        params: { data_fim: dataFim },
      });
      return data;
    },
    enabled: Boolean(dataFim),
  });
}
