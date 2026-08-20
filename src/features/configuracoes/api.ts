import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

import type {
  CondicaoPagamento,
  CondicaoPagamentoInput,
  EtiquetaModelo,
  EtiquetaModeloInput,
  TabelaPreco,
  TabelaPrecoInput,
} from "./types";

export function useConfiguracoes() {
  return useQuery({
    queryKey: ["configuracoes"],
    queryFn: async () => {
      const { data } = await api.get<{ valores: Record<string, string> }>("/configuracoes");
      return data.valores;
    },
  });
}

export function useSalvarConfiguracoes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (valores: Record<string, string>) => {
      const { data } = await api.put<{ valores: Record<string, string> }>("/configuracoes", valores);
      return data.valores;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["configuracoes"] }),
  });
}

/* ---------------------------------------------------------- Etiquetas */

const ETIQUETAS_KEY = ["configuracoes-etiquetas"];

export function useEtiquetaModelos() {
  return useQuery({
    queryKey: ETIQUETAS_KEY,
    queryFn: async () => {
      const { data } = await api.get<EtiquetaModelo[]>("/configuracoes/etiquetas");
      return data;
    },
  });
}

export function useCreateEtiquetaModelo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: EtiquetaModeloInput) => {
      const { data } = await api.post<EtiquetaModelo>("/configuracoes/etiquetas", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ETIQUETAS_KEY }),
  });
}

export function useMarcarEtiquetaPadrao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<EtiquetaModelo>(`/configuracoes/etiquetas/${id}/padrao`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ETIQUETAS_KEY }),
  });
}

export function useDeleteEtiquetaModelo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/configuracoes/etiquetas/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ETIQUETAS_KEY }),
  });
}

/* ------------------------------------------------------ Tabelas de preco */

const TABELAS_PRECO_KEY = ["configuracoes-tabelas-preco"];

export function useTabelasPreco() {
  return useQuery({
    queryKey: TABELAS_PRECO_KEY,
    queryFn: async () => {
      const { data } = await api.get<TabelaPreco[]>("/configuracoes/tabelas-preco");
      return data;
    },
  });
}

export function useCreateTabelaPreco() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TabelaPrecoInput) => {
      const { data } = await api.post<TabelaPreco>("/configuracoes/tabelas-preco", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TABELAS_PRECO_KEY }),
  });
}

export function useMarcarTabelaPrecoPadrao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<TabelaPreco>(`/configuracoes/tabelas-preco/${id}/padrao`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TABELAS_PRECO_KEY }),
  });
}

export function useDeleteTabelaPreco() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/configuracoes/tabelas-preco/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TABELAS_PRECO_KEY }),
  });
}

/* --------------------------------------------------- Condicoes pagamento */

const CONDICOES_PAGAMENTO_KEY = ["configuracoes-condicoes-pagamento"];

export function useCondicoesPagamento() {
  return useQuery({
    queryKey: CONDICOES_PAGAMENTO_KEY,
    queryFn: async () => {
      const { data } = await api.get<CondicaoPagamento[]>("/configuracoes/condicoes-pagamento");
      return data;
    },
  });
}

export function useCreateCondicaoPagamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CondicaoPagamentoInput) => {
      const { data } = await api.post<CondicaoPagamento>("/configuracoes/condicoes-pagamento", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CONDICOES_PAGAMENTO_KEY }),
  });
}

export function useMarcarCondicaoPagamentoPadrao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<CondicaoPagamento>(`/configuracoes/condicoes-pagamento/${id}/padrao`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CONDICOES_PAGAMENTO_KEY }),
  });
}

export function useDeleteCondicaoPagamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/configuracoes/condicoes-pagamento/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CONDICOES_PAGAMENTO_KEY }),
  });
}
