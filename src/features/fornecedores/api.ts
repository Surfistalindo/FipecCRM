import { makeCrud } from "@/lib/crud";

import type { Fornecedor } from "./types";

const crud = makeCrud<Fornecedor>("fornecedores");

export const useFornecedores = crud.useList;
export const useCreateFornecedor = crud.useCreate;
export const useUpdateFornecedor = crud.useUpdate;
export const useDeleteFornecedor = crud.useRemove;
