import { FileCheck, FileText, FileX, Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, StatCard } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useVendas } from "@/features/vendas/api";
import type { StatusNF } from "@/features/vendas/types";
import { formatDate } from "@/lib/format";
import { formatCurrency } from "@/lib/utils";

const STATUS_META: Record<StatusNF, { label: string; variant: "success" | "default" | "secondary" }> = {
  autorizada: { label: "Autorizada", variant: "success" },
  emitida: { label: "Emitida", variant: "default" },
  pendente: { label: "Pendente", variant: "secondary" },
};

export function FiscalPage() {
  const { data } = useVendas({ size: 100 });
  const notas = data?.items ?? [];

  const autorizadas = notas.filter((n) => n.nf_status === "autorizada").length;
  const pendentes = notas.filter((n) => n.nf_status === "pendente").length;

  return (
    <div className="space-y-6">
      <PageHeader path="/fiscal" actions={<Button onClick={() => toast.info("Emita a NF-e a partir da tela de Vendas")}><Plus /> Emitir NF-e</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Autorizadas" value={autorizadas} icon={FileCheck} tone="success" />
        <StatCard label="Pendentes" value={pendentes} icon={FileX} tone="warning" />
        <StatCard label="Total de notas" value={notas.length} icon={FileText} />
      </div>

      <Card>
        <CardHeader><CardTitle>Documentos fiscais</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead className="hidden md:table-cell">Cliente</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notas.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-mono text-sm">{n.numero}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {n.cliente?.nome ?? "Consumidor final"} · {formatDate(n.data)}
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(n.total)}</TableCell>
                  <TableCell><Badge variant={STATUS_META[n.nf_status].variant}>{STATUS_META[n.nf_status].label}</Badge></TableCell>
                </TableRow>
              ))}
              {notas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    Nenhuma venda registrada ainda
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
