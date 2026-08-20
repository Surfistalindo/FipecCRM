import {
  BarChart3,
  Boxes,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const HIGHLIGHTS = [
  { icon: BarChart3, title: "Gestão completa", desc: "Vendas, estoque, financeiro e fiscal em um só lugar." },
  { icon: Zap, title: "Tempo real", desc: "Indicadores e movimentações atualizados na hora." },
  { icon: ShieldCheck, title: "Seguro", desc: "Autenticação com 2FA e auditoria de acessos." },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [totp, setTotp] = React.useState("");
  const [needs2fa, setNeeds2fa] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password, totp || undefined);
      navigate("/", { replace: true });
    } catch (err) {
      const msg = apiErrorMessage(err, "Falha no login");
      if (/2fa/i.test(msg)) setNeeds2fa(true);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Painel de marca (desktop) */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-primary via-primary to-[hsl(14_80%_42%)] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative flex items-center gap-3 text-primary-foreground">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Boxes className="h-6 w-6" />
          </div>
          <span className="font-display text-lg font-bold">ERP Web</span>
        </div>

        <div className="relative space-y-8 text-primary-foreground">
          <h2 className="max-w-md font-display text-4xl font-bold leading-tight xl:text-[2.75rem]">
            A gestão do seu negócio, do jeito profissional.
          </h2>
          <div className="space-y-5">
            {HIGHLIGHTS.map((h) => {
              const Icon = h.icon;
              return (
                <div key={h.title} className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{h.title}</p>
                    <p className="text-sm text-primary-foreground/80">{h.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="relative text-sm text-primary-foreground/70">
          © 2026 ERP Web · Todos os direitos reservados
        </p>
      </div>

      {/* Formulário */}
      <div className="flex w-full flex-col items-center justify-center bg-muted/40 p-6 lg:w-1/2">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-primary">
              <Boxes className="h-6 w-6" />
            </div>
            <h1 className="font-display text-xl font-bold">ERP Web</h1>
          </div>

          <div className="rounded-2xl border bg-card p-7 shadow-lg">
            <div className="mb-6 space-y-1.5">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                Bem-vindo de volta
              </h1>
              <p className="text-sm text-muted-foreground">
                Acesse sua conta para continuar
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {needs2fa && (
                <div className="space-y-1.5">
                  <Label htmlFor="totp">Código 2FA</Label>
                  <Input
                    id="totp"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={totp}
                    onChange={(e) => setTotp(e.target.value)}
                  />
                </div>
              )}

              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Entrar
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
