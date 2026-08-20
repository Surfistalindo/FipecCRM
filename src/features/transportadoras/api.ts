import { makeCrud } from "@/lib/crud";

import type { Transportadora } from "./types";

const crud = makeCrud<Transportadora>("transportadoras");

export const useTransportadoras = crud.useList;
export const useCreateTransportadora = crud.useCreate;
export const useUpdateTransportadora = crud.useUpdate;
export const useDeleteTransportadora = crud.useRemove;
