import { Eraser } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";

export function SignaturePad({ onSave, saving }: { onSave: (base64: string) => void; saving?: boolean }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const drawing = React.useRef(false);
  const [empty, setEmpty] = React.useState(true);

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    setEmpty(false);
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  function end() {
    drawing.current = false;
  }

  function limpar() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setEmpty(true);
  }

  function salvar() {
    const canvas = canvasRef.current!;
    onSave(canvas.toDataURL("image/png"));
  }

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        width={480}
        height={160}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="w-full touch-none rounded-lg border bg-white"
      />
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={limpar}>
          <Eraser className="h-3.5 w-3.5" /> Limpar
        </Button>
        <Button size="sm" onClick={salvar} disabled={empty || saving}>
          Confirmar assinatura
        </Button>
      </div>
    </div>
  );
}
