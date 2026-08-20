import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

import type { AutorMensagem, Chamado, ChamadoInput, StatusChamado } from "./types";

const KEY = ["atendimento-chamados"];

export function useChamados() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data } = await api.get<Chamado[]>("/atendimento/chamados");
      return data;
    },
    refetchInterval: 15000,
  });
}

export function useContagemStatus() {
  return useQuery({
    queryKey: ["atendimento-contagem-status"],
    queryFn: async () => {
      const { data } = await api.get<Record<StatusChamado, number>>("/atendimento/chamados/contagem-status");
      return data;
    },
  });
}

export function useCreateChamado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ChamadoInput) => {
      const { data } = await api.post<Chamado>("/atendimento/chamados", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["atendimento-contagem-status"] });
    },
  });
}

export function useMudarStatusChamado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: StatusChamado }) => {
      const { data } = await api.post<Chamado>(`/atendimento/chamados/${id}/status/${status}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["atendimento-contagem-status"] });
    },
  });
}

export function useAdicionarMensagem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      mensagem,
      autor_tipo,
    }: {
      id: number;
      mensagem: string;
      autor_tipo: AutorMensagem;
    }) => {
      const { data } = await api.post<Chamado>(`/atendimento/chamados/${id}/mensagens`, { mensagem, autor_tipo });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useAvaliarChamado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, avaliacao }: { id: number; avaliacao: number }) => {
      const { data } = await api.post<Chamado>(`/atendimento/chamados/${id}/avaliar`, { avaliacao });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteChamado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/atendimento/chamados/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["atendimento-contagem-status"] });
    },
  });
}
