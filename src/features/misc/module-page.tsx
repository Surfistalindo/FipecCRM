import { ChevronRight, Hammer, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ModuleDef } from "@/config/modules";

export function ModulePage({ module }: { module: ModuleDef }) {
  const Icon = module.icon;
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Início
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>{module.group}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{module.label}</span>
      </nav>

      {/* Cabecalho */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {module.label}
            </h1>
            <Badge variant="secondary">
              <Hammer className="mr-1 h-3 w-3" /> Em desenvolvimento
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {module.description}
          </p>
        </div>
      </div>

      {/* Recursos planejados */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Recursos planejados
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {module.features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3 text-sm"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {feature.charAt(0)}
                </span>
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rodape informativo */}
      <div className="rounded-lg border border-dashed bg-primary/5 p-4 text-sm text-muted-foreground">
        Este módulo já está acessível na navegação. A implementação funcional
        (CRUD + integrações) seguirá o mesmo padrão da fatia vertical de{" "}
        <Link to="/clientes" className="font-medium text-primary hover:underline">
          Clientes
        </Link>
        .
      </div>
    </div>
  );
}
