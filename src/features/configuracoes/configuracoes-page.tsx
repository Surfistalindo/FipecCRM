import {
  Building2,
  Calculator,
  CreditCard,
  KeyRound,
  MonitorSmartphone,
  Sliders,
  Tags,
  Tag,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

import { useConfiguracoes, useSalvarConfiguracoes } from "./api";
import { SecaoCondicoesPagamento } from "./secao-condicoes-pagamento";
import { SecaoEtiquetas } from "./secao-etiquetas";
import { SecaoTabelasPreco } from "./secao-tabelas-preco";

const DEFAULTS: Record<string, string> = {
  razao_social: "ERP Web Comércio LTDA",
  cnpj: "12.345.678/0001-90",
  inscricao_estadual: "123.456.789.000",
  telefone: "(11) 3322-4455",
  email: "contato@erpweb.com.br",
  endereco: "Av. Paulista, 1000 - São Paulo/SP",
  notif_email: "true",
  notif_whatsapp: "false",
  alerta_estoque: "true",
  backup_automatico: "true",
  regime_tributario: "simples",
  ambiente_nfe: "homologacao",
  serie_nfe: "1",
  proximo_numero_nfe: "1237",
  senha_min_caracteres: "8",
  senha_expira_dias: "90",
  max_tentativas_login: "5",
  exigir_2fa_admin: "false",
  pdv_permite_desconto_manual: "true",
  pdv_desconto_max_pct: "10",
  pdv_exige_supervisor_cancelamento: "true",
  pdv_imprime_via_automatica: "true",
};

type SecaoKey =
  | "empresa"
  | "preferencias"
  | "fiscal"
  | "etiquetas"
  | "tabelas-preco"
  | "condicoes-pagamento"
  | "seguranca"
  | "pdv";

const SECOES: { key: SecaoKey; label: string; icon: typeof Building2 }[] = [
  { key: "empresa", label: "Empresa", icon: Building2 },
  { key: "preferencias", label: "Preferências", icon: Sliders },
  { key: "fiscal", label: "Fiscal", icon: Calculator },
  { key: "etiquetas", label: "Etiquetas", icon: Tags },
  { key: "tabelas-preco", label: "Tabelas de preço", icon: Tag },
  { key: "condicoes-pagamento", label: "Condições de pagamento", icon: CreditCard },
  { key: "seguranca", label: "Segurança", icon: KeyRound },
  { key: "pdv", label: "PDV", icon: MonitorSmartphone },
];

function Row({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b py-4 last:border-0">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={title} />
    </div>
  );
}

export function ConfiguracoesPage() {
  const { data } = useConfiguracoes();
  const salvarMut = useSalvarConfiguracoes();
  const [form, setForm] = React.useState<Record<string, string>>(DEFAULTS);
  const [secao, setSecao] = React.useState<SecaoKey>("empresa");
  const loaded = React.useRef(false);

  React.useEffect(() => {
    if (data && !loaded.current) {
      setForm({ ...DEFAULTS, ...data });
      loaded.current = true;
    }
  }, [data]);

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function salvar() {
    try {
      await salvarMut.mutateAsync(form);
      toast.success("Configurações salvas");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível salvar"));
    }
  }

  const mostraBotaoSalvar = !["etiquetas", "tabelas-preco", "condicoes-pagamento"].includes(secao);

  return (
    <div className="space-y-6">
      <PageHeader
        path="/configuracoes"
        actions={
          mostraBotaoSalvar ? (
            <Button onClick={salvar} disabled={salvarMut.isPending}>
              Salvar
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {SECOES.map((s) => (
            <button
              key={s.key}
              onClick={() => setSecao(s.key)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors lg:shrink",
                secao === s.key
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <s.icon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap lg:whitespace-normal">{s.label}</span>
            </button>
          ))}
        </nav>

        <div>
          {secao === "empresa" && (
            <Card>
              <CardHeader>
                <CardTitle>Dados da empresa</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Razão social</Label>
                  <Input value={form.razao_social} onChange={(e) => set("razao_social", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>CNPJ</Label>
                  <Input value={form.cnpj} onChange={(e) => set("cnpj", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Inscrição estadual</Label>
                  <Input value={form.inscricao_estadual} onChange={(e) => set("inscricao_estadual", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Telefone</Label>
                  <Input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>E-mail</Label>
                  <Input value={form.email} onChange={(e) => set("email", e.target.value)} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Endereço</Label>
                  <Input value={form.endereco} onChange={(e) => set("endereco", e.target.value)} />
                </div>
              </CardContent>
            </Card>
          )}

          {secao === "preferencias" && (
            <Card>
              <CardHeader>
                <CardTitle>Notificações e sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <Row
                  title="Notificações por e-mail"
                  desc="Receber alertas e resumos por e-mail"
                  checked={form.notif_email === "true"}
                  onChange={(v) => set("notif_email", String(v))}
                />
                <Row
                  title="Notificações por WhatsApp"
                  desc="Enviar avisos via WhatsApp"
                  checked={form.notif_whatsapp === "true"}
                  onChange={(v) => set("notif_whatsapp", String(v))}
                />
                <Row
                  title="Alerta de estoque baixo"
                  desc="Avisar quando produtos atingirem o mínimo"
                  checked={form.alerta_estoque === "true"}
                  onChange={(v) => set("alerta_estoque", String(v))}
                />
                <Row
                  title="Backup automático diário"
                  desc="Backup do banco de dados todos os dias às 3h"
                  checked={form.backup_automatico === "true"}
                  onChange={(v) => set("backup_automatico", String(v))}
                />
              </CardContent>
            </Card>
          )}

          {secao === "fiscal" && (
            <Card>
              <CardHeader>
                <CardTitle>Configuração fiscal</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Regime tributário</Label>
                  <Select value={form.regime_tributario} onChange={(e) => set("regime_tributario", e.target.value)}>
                    <option value="simples">Simples Nacional</option>
                    <option value="presumido">Lucro Presumido</option>
                    <option value="real">Lucro Real</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Ambiente NF-e</Label>
                  <Select value={form.ambiente_nfe} onChange={(e) => set("ambiente_nfe", e.target.value)}>
                    <option value="homologacao">Homologação</option>
                    <option value="producao">Produção</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Série NF-e</Label>
                  <Input value={form.serie_nfe} onChange={(e) => set("serie_nfe", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Próximo número</Label>
                  <Input value={form.proximo_numero_nfe} onChange={(e) => set("proximo_numero_nfe", e.target.value)} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Certificado digital A1</Label>
                  <Input type="file" />
                </div>
              </CardContent>
            </Card>
          )}

          {secao === "etiquetas" && (
            <Card>
              <CardContent className="p-5">
                <SecaoEtiquetas />
              </CardContent>
            </Card>
          )}

          {secao === "tabelas-preco" && (
            <Card>
              <CardContent className="p-5">
                <SecaoTabelasPreco />
              </CardContent>
            </Card>
          )}

          {secao === "condicoes-pagamento" && (
            <Card>
              <CardContent className="p-5">
                <SecaoCondicoesPagamento />
              </CardContent>
            </Card>
          )}

          {secao === "seguranca" && (
            <Card>
              <CardHeader>
                <CardTitle>Política de segurança</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Tamanho mínimo da senha</Label>
                  <Input
                    type="number"
                    value={form.senha_min_caracteres}
                    onChange={(e) => set("senha_min_caracteres", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Expiração da senha (dias)</Label>
                  <Input
                    type="number"
                    value={form.senha_expira_dias}
                    onChange={(e) => set("senha_expira_dias", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Máximo de tentativas de login</Label>
                  <Input
                    type="number"
                    value={form.max_tentativas_login}
                    onChange={(e) => set("max_tentativas_login", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Row
                    title="Exigir 2FA para administradores"
                    desc="Obriga autenticação em duas etapas para usuários com perfil admin"
                    checked={form.exigir_2fa_admin === "true"}
                    onChange={(v) => set("exigir_2fa_admin", String(v))}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {secao === "pdv" && (
            <Card>
              <CardHeader>
                <CardTitle>Ponto de venda (PDV)</CardTitle>
              </CardHeader>
              <CardContent>
                <Row
                  title="Permitir desconto manual"
                  desc="Operador do PDV pode aplicar desconto na venda"
                  checked={form.pdv_permite_desconto_manual === "true"}
                  onChange={(v) => set("pdv_permite_desconto_manual", String(v))}
                />
                {form.pdv_permite_desconto_manual === "true" && (
                  <div className="space-y-1.5 border-b py-4">
                    <Label>Desconto máximo sem aprovação (%)</Label>
                    <Input
                      type="number"
                      className="max-w-[160px]"
                      value={form.pdv_desconto_max_pct}
                      onChange={(e) => set("pdv_desconto_max_pct", e.target.value)}
                    />
                  </div>
                )}
                <Row
                  title="Exigir supervisor para cancelamento"
                  desc="Cancelar uma venda no PDV exige senha de supervisor"
                  checked={form.pdv_exige_supervisor_cancelamento === "true"}
                  onChange={(v) => set("pdv_exige_supervisor_cancelamento", String(v))}
                />
                <Row
                  title="Imprimir via automaticamente"
                  desc="Imprime o cupom/recibo assim que a venda é finalizada"
                  checked={form.pdv_imprime_via_automatica === "true"}
                  onChange={(v) => set("pdv_imprime_via_automatica", String(v))}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
