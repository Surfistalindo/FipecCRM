import { makeCrud } from "@/lib/crud";

import type { Vendedor } from "./types";

const crud = makeCrud<Vendedor>("vendedores");

export const useVendedores = crud.useList;
export const useCreateVendedor = crud.useCreate;
export const useUpdateVendedor = crud.useUpdate;
export const useDeleteVendedor = crud.useRemove;
