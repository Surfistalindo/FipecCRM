import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Page } from "@/lib/crud";

import type {
  Equipamento,
  EquipamentoInput,
  OrdemServico,
  OrdemServicoCreateInput,
  OrdemServicoItemInput,
  OrdemServicoUpdateInput,
  StatusOS,
} from "./types";

export function useOrdensServico(params: { status?: StatusOS; cliente_id?: number; size?: number } = {}) {
  return useQuery({
    queryKey: ["ordens-servico", params],
    queryFn: async () => {
      const { data } = await api.get<Page<OrdemServico>>("/ordens-servico", { params: { size: 100, ...params } });
      return data;
    },
  });
}

export function useOrdemServico(id: number | null) {
  return useQuery({
    queryKey: ["ordem-servico", id],
    queryFn: async () => {
      const { data } = await api.get<OrdemServico>(`/ordens-servico/${id}`);
      return data;
    },
    enabled: id !== null,
  });
}

function invalidateOS(qc: ReturnType<typeof useQueryClient>, id?: number) {
  qc.invalidateQueries({ queryKey: ["ordens-servico"] });
  if (id) qc.invalidateQueries({ queryKey: ["ordem-servico", id] });
}

export function useCreateOrdemServico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: OrdemServicoCreateInput) => {
      const { data } = await api.post<OrdemServico>("/ordens-servico", payload);
      return data;
    },
    onSuccess: () => invalidateOS(qc),
  });
}

export function useUpdateOrdemServico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: OrdemServicoUpdateInput }) => {
      const { data } = await api.put<OrdemServico>(`/ordens-servico/${id}`, payload);
      return data;
    },
    onSuccess: (_data, { id }) => invalidateOS(qc, id),
  });
}

export function useMudarStatusOS() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, observacao }: { id: number; status: StatusOS; observacao?: string }) => {
      const { data } = await api.post<OrdemServico>(`/ordens-servico/${id}/status`, { status, observacao });
      return data;
    },
    onSuccess: (_data, { id }) => invalidateOS(qc, id),
  });
}

export function useAdicionarItemOS() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: OrdemServicoItemInput }) => {
      const { data } = await api.post<OrdemServico>(`/ordens-servico/${id}/itens`, payload);
      return data;
    },
    onSuccess: (_data, { id }) => invalidateOS(qc, id),
  });
}

export function useRemoverItemOS() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, itemId }: { id: number; itemId: number }) => {
      const { data } = await api.delete<OrdemServico>(`/ordens-servico/${id}/itens/${itemId}`);
      return data;
    },
    onSuccess: (_data, { id }) => invalidateOS(qc, id),
  });
}

export function useAdicionarAnexoOS() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, nome, url }: { id: number; nome: string; url: string }) => {
      const { data } = await api.post<OrdemServico>(`/ordens-servico/${id}/anexos`, { nome, url });
      return data;
    },
    onSuccess: (_data, { id }) => invalidateOS(qc, id),
  });
}

export function useRemoverAnexoOS() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, anexoId }: { id: number; anexoId: number }) => {
      const { data } = await api.delete<OrdemServico>(`/ordens-servico/${id}/anexos/${anexoId}`);
      return data;
    },
    onSuccess: (_data, { id }) => invalidateOS(qc, id),
  });
}

export function useAssinarOS() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, assinatura_base64 }: { id: number; assinatura_base64: string }) => {
      const { data } = await api.post<OrdemServico>(`/ordens-servico/${id}/assinatura`, { assinatura_base64 });
      return data;
    },
    onSuccess: (_data, { id }) => invalidateOS(qc, id),
  });
}

export function useEquipamentos(clienteId?: number) {
  return useQuery({
    queryKey: ["equipamentos", clienteId],
    queryFn: async () => {
      const { data } = await api.get<Equipamento[]>("/equipamentos", {
        params: clienteId ? { cliente_id: clienteId } : undefined,
      });
      return data;
    },
    enabled: clienteId !== undefined,
  });
}

export function useCreateEquipamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: EquipamentoInput) => {
      const { data } = await api.post<Equipamento>("/equipamentos", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["equipamentos"] }),
  });
}
