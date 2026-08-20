import { Check, Copy, QrCode, Zap } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader, StatCard } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiErrorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { formatCurrency } from "@/lib/utils";

import { useCobrancasPix, useCreateCobrancaPix } from "./api";

const PIX_KEY = "pagamentos@erpweb.com.br";

/** QR pseudo-aleatorio deterministico (visual). */
function FakeQR({ seed }: { seed: number }) {
  const n = 21;
  const cells = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const corner =
        (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
      const on = corner
        ? !((x > 0 && x < 6 && y > 0 && y < 6) && !(x > 1 && x < 5 && y > 1 && y < 5))
        : ((x * 31 + y * 17 + seed) % 3 === 0);
      cells.push(
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={on ? "currentColor" : "transparent"} />,
      );
    }
  }
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="h-48 w-48 text-foreground">
      {cells}
    </svg>
  );
}

export function PixPage() {
  const [valor, setValor] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [seed, setSeed] = React.useState(7);

  const { data: items = [] } = useCobrancasPix();
  const createMut = useCreateCobrancaPix();

  async function gerar() {
    if (!valor || Number(valor) <= 0) return toast.error("Informe o valor");
    try {
      await createMut.mutateAsync({ descricao: desc || "Cobrança PIX", valor });
      setSeed((s) => s + 13);
      toast.success("QR Code PIX gerado");
      setValor("");
      setDesc("");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Nao foi possivel gerar"));
    }
  }

  const recebido = items.filter((c) => c.paga).reduce((a, c) => a + Number(c.valor), 0);

  return (
    <div className="space-y-6">
      <PageHeader path="/pix" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Recebido via PIX" value={formatCurrency(recebido)} icon={Zap} tone="success" />
        <StatCard label="Cobranças ativas" value={items.filter((c) => !c.paga).length} icon={QrCode} tone="warning" />
        <StatCard label="Total de cobranças" value={items.length} icon={QrCode} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Nova cobrança PIX</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="rounded-xl border bg-white p-4 dark:bg-white">
              <FakeQR seed={seed} />
            </div>
            <div className="flex w-full items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
              <span className="flex-1 truncate font-mono">{PIX_KEY}</span>
              <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard?.writeText(PIX_KEY); toast.success("Chave PIX copiada"); }}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid w-full grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Valor</Label><Input type="number" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" /></div>
              <div className="space-y-1.5"><Label>Descrição</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
            </div>
            <Button className="w-full" onClick={gerar} disabled={createMut.isPending}><QrCode /> Gerar novo QR</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Cobranças recentes</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {items.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{c.descricao}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(c.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(c.valor)}</p>
                  {c.paga ? <Badge variant="success"><Check className="mr-1 h-3 w-3" />Paga</Badge> : <Badge variant="secondary">Aguardando</Badge>}
                </div>
              </div>
            ))}
            {items.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma cobrança gerada ainda.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
