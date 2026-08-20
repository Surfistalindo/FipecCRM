import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiErrorMessage } from "@/lib/api";

import { useCompromissos, useCreateCompromisso } from "./api";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export function AgendaPage() {
  const [year, setYear] = React.useState(2026);
  const [month, setMonth] = React.useState(6); // julho (0-based)

  const { data: compromissos = [] } = useCompromissos();
  const createMut = useCreateCompromisso();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function prev() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1);
  }
  function next() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1);
  }

  async function addEvent(day: number) {
    const titulo = prompt(`Novo compromisso em ${day}/${month + 1}:`);
    if (!titulo) return;
    const data = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    try {
      await createMut.mutateAsync({ titulo, data, hora: "12:00" });
      toast.success("Compromisso adicionado");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Nao foi possivel adicionar"));
    }
  }

  const porDia = (day: number) => {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return compromissos.filter((c) => c.data === key);
  };

  const proximos = [...compromissos].sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));

  return (
    <div className="space-y-6">
      <PageHeader path="/agenda" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>{MONTHS[month]} {year}</CardTitle>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS.map((w) => (
                <div key={w} className="pb-2 text-center text-xs font-medium text-muted-foreground">{w}</div>
              ))}
              {cells.map((day, i) => {
                if (day === null) return <div key={`e${i}`} />;
                const evs = porDia(day);
                return (
                  <button
                    key={`d${day}`}
                    onClick={() => addEvent(day)}
                    className="flex min-h-20 flex-col gap-1 rounded-lg border p-1.5 text-left transition-colors hover:bg-accent"
                  >
                    <span className="text-xs font-medium">{day}</span>
                    {evs.slice(0, 2).map((e) => (
                      <span key={e.id} className={`truncate rounded px-1 py-0.5 text-[10px] text-white ${e.cor}`}>{e.hora.slice(0, 5)} {e.titulo}</span>
                    ))}
                    {evs.length > 2 && <span className="text-[10px] text-muted-foreground">+{evs.length - 2}</span>}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Próximos</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {proximos.map((e) => (
              <div key={e.id} className="flex items-start gap-2 text-sm">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${e.cor}`} />
                <div>
                  <p className="font-medium">{e.titulo}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {e.data.split("-").reverse().join("/")} · {e.hora.slice(0, 5)}
                  </p>
                </div>
              </div>
            ))}
            {proximos.length === 0 && <p className="text-sm text-muted-foreground">Nenhum compromisso cadastrado.</p>}
          </CardContent>
        </Card>
      </div>
      <Badge variant="secondary">Clique em um dia para adicionar um compromisso</Badge>
    </div>
  );
}
