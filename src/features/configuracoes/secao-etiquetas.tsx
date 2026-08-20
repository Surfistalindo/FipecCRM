import { Barcode, Plus, Printer, Star, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

import {
  useCreateEtiquetaModelo,
  useDeleteEtiquetaModelo,
  useEtiquetaModelos,
  useMarcarEtiquetaPadrao,
} from "./api";
import type { EtiquetaModeloInput, TipoImpressoraEtiqueta } from "./types";

const IMPRESSORA_LABEL: Record<TipoImpressoraEtiqueta, string> = {
  termica: "Térmica",
  laser: "Laser",
  jato_de_tinta: "Jato de tinta",
};

const EMPTY: EtiquetaModeloInput = {
  nome: "",
  largura_mm: 40,
  altura_mm: 25,
  tipo_impressora: "termica",
  mostrar_codigo_barras: true,
  mostrar_preco: true,
  mostrar_descricao: true,
  mostrar_marca: false,
};

function EtiquetaPreview({ form }: { form: EtiquetaModeloInput }) {
  const ratio = form.largura_mm / form.altura_mm;
  return (
    <div className="flex items-center justify-center rounded-lg bg-muted/40 p-6">
      <div
        className="flex flex-col justify-center gap-1 rounded-sm border-2 border-dashed border-muted-foreground/40 bg-background p-3 shadow-sm"
        style={{ width: 180, aspectRatio: ratio, minHeight: 60 }}
      >
        {form.mostrar_descricao && <p className="truncate text-[11px] font-semibold">Pastilha de freio</p>}
        {form.mostrar_marca && <p className="truncate text-[9px] text-muted-foreground">Cobreq</p>}
        {form.mostrar_preco && <p className="text-sm font-bold text-primary">R$ 89,90</p>}
        {form.mostrar_codigo_barras && (
          <div className="flex h-5 items-end gap-[1px]">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="bg-foreground"
                style={{ width: 1.5, height: (i % 3) + 3 }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SecaoEtiquetas() {
  const { data: modelos = [], isLoading } = useEtiquetaModelos();
  const createMut = useCreateEtiquetaModelo();
  const padraoMut = useMarcarEtiquetaPadrao();
  const deleteMut = useDeleteEtiquetaModelo();

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<EtiquetaModeloInput>(EMPTY);

  async function salvar() {
    if (!form.nome.trim()) {
      toast.error("Informe o nome do modelo");
      return;
    }
    try {
      await createMut.mutateAsync(form);
      toast.success("Modelo de etiqueta criado");
      setForm(EMPTY);
      setOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível criar o modelo"));
    }
  }

  async function marcarPadrao(id: number) {
    try {
      await padraoMut.mutateAsync(id);
      toast.success("Modelo definido como padrão");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível definir como padrão"));
    }
  }

  async function remover(id: number) {
    try {
      await deleteMut.mutateAsync(id);
      toast.success("Modelo removido");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível remover"));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">Modelos de etiqueta</h3>
          <p className="text-xs text-muted-foreground">
            Layouts de impressão para preço e código de barras (PDV, expedição, gôndola).
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Novo modelo
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {!isLoading && modelos.length === 0 && (
        <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          Nenhum modelo de etiqueta cadastrado.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {modelos.map((m) => (
          <Card key={m.id} className={cn(m.padrao && "border-primary")}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-sm font-semibold">{m.nome}</p>
                </div>
                {m.padrao && (
                  <Badge variant="default" className="gap-1">
                    <Star className="h-3 w-3 fill-current" /> Padrão
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {m.largura_mm}×{m.altura_mm}mm · {IMPRESSORA_LABEL[m.tipo_impressora]}
              </p>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                {m.mostrar_codigo_barras && <Barcode className="h-3.5 w-3.5" />}
              </div>
              <div className="flex items-center justify-between pt-1">
                {!m.padrao ? (
                  <Button size="sm" variant="outline" onClick={() => marcarPadrao(m.id)}>
                    Definir padrão
                  </Button>
                ) : (
                  <span />
                )}
                <Button size="icon" variant="ghost" onClick={() => remover(m.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo modelo de etiqueta</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Largura (mm)</Label>
              <Input
                type="number"
                value={form.largura_mm}
                onChange={(e) => setForm({ ...form, largura_mm: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Altura (mm)</Label>
              <Input
                type="number"
                value={form.altura_mm}
                onChange={(e) => setForm({ ...form, altura_mm: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Impressora</Label>
              <Select
                value={form.tipo_impressora}
                onChange={(e) => setForm({ ...form, tipo_impressora: e.target.value as TipoImpressoraEtiqueta })}
              >
                {Object.entries(IMPRESSORA_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>
            <div className="col-span-2 space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <Label className="font-normal">Mostrar descrição</Label>
                <Switch
                  checked={form.mostrar_descricao}
                  onCheckedChange={(v) => setForm({ ...form, mostrar_descricao: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-normal">Mostrar marca</Label>
                <Switch checked={form.mostrar_marca} onCheckedChange={(v) => setForm({ ...form, mostrar_marca: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-normal">Mostrar preço</Label>
                <Switch checked={form.mostrar_preco} onCheckedChange={(v) => setForm({ ...form, mostrar_preco: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-normal">Mostrar código de barras</Label>
                <Switch
                  checked={form.mostrar_codigo_barras}
                  onCheckedChange={(v) => setForm({ ...form, mostrar_codigo_barras: v })}
                />
              </div>
            </div>
            <div className="col-span-2">
              <EtiquetaPreview form={form} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={salvar} disabled={createMut.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
