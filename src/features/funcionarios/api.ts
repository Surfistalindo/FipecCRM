import { makeCrud } from "@/lib/crud";

import type { Funcionario } from "./types";

const crud = makeCrud<Funcionario>("funcionarios");

export const useFuncionarios = crud.useList;
export const useCreateFuncionario = crud.useCreate;
export const useUpdateFuncionario = crud.useUpdate;
export const useDeleteFuncionario = crud.useRemove;
