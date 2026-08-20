import { makeCrud } from "@/lib/crud";

import type { Produto } from "./types";

const crud = makeCrud<Produto>("produtos");

export const useProdutos = crud.useList;
export const useCreateProduto = crud.useCreate;
export const useUpdateProduto = crud.useUpdate;
export const useDeleteProduto = crud.useRemove;
