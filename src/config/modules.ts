import {
  Award,
  BadgeDollarSign,
  Banknote,
  BarChart3,
  BookMarked,
  Boxes,
  Building2,
  Calculator,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Cog,
  Container,
  Contact,
  CreditCard,
  FileText,
  Handshake,
  Headset,
  IdCard,
  Landmark,
  LayoutDashboard,
  LayoutGrid,
  type LucideIcon,
  Package,
  PackageCheck,
  PiggyBank,
  Plug,
  QrCode,
  Receipt,
  Scale,
  ScrollText,
  ShieldCheck,
  ShoppingCart,
  Tags,
  Truck,
  UserCog,
  Users,
  Warehouse,
  Wrench,
} from "lucide-react";

export type ModuleGroup =
  | "Geral"
  | "Cadastros"
  | "Operações"
  | "Financeiro"
  | "Relacionamento"
  | "Administração";

export interface ModuleDef {
  /** identificador de rota, ex: "clientes" (Dashboard usa "") */
  key: string;
  path: string;
  label: string;
  icon: LucideIcon;
  group: ModuleGroup;
  description: string;
  /** recursos planejados exibidos na pagina do modulo */
  features: string[];
  /** true = modulo ja implementado (tem pagina propria) */
  ready?: boolean;
}

export const GROUP_ORDER: ModuleGroup[] = [
  "Geral",
  "Cadastros",
  "Operações",
  "Financeiro",
  "Relacionamento",
  "Administração",
];

/** Icone de cabecalho de cada grupo na sidebar (menu -> submenu). */
export const GROUP_ICONS: Record<ModuleGroup, LucideIcon> = {
  Geral: LayoutGrid,
  Cadastros: Contact,
  Operações: ShoppingCart,
  Financeiro: Landmark,
  Relacionamento: Handshake,
  Administração: ShieldCheck,
};

export const MODULES: ModuleDef[] = [
  {
    key: "dashboard",
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    group: "Geral",
    description: "Visão geral do negócio com KPIs, gráficos e alertas.",
    features: ["Fluxo de caixa", "Produtos mais vendidos", "Alertas inteligentes"],
    ready: true,
  },

  // ---- Cadastros ----
  {
    key: "clientes",
    path: "/clientes",
    label: "Clientes",
    icon: Users,
    group: "Cadastros",
    description: "Cadastro completo de clientes, crédito e histórico.",
    features: ["PF e PJ", "Validação de CPF/CNPJ", "Limite de crédito", "Histórico"],
    ready: true,
  },
  {
    key: "fornecedores",
    path: "/fornecedores",
    label: "Fornecedores",
    icon: Building2,
    group: "Cadastros",
    description: "Fornecedores, condições comerciais e histórico de compras.",
    features: [
      "Dados fiscais (CNPJ/IE)",
      "Contatos e endereços",
      "Produtos fornecidos",
      "Histórico de compras",
    ],
  },
  {
    key: "produtos",
    path: "/produtos",
    label: "Produtos",
    icon: Package,
    group: "Cadastros",
    description: "Catálogo de produtos com dados fiscais, preços e estoque.",
    features: [
      "SKU, EAN, NCM, CEST",
      "Preços de custo/venda/promocional",
      "Estoque mínimo e máximo",
      "Múltiplos fornecedores",
      "Fotos e dimensões",
    ],
  },
  {
    key: "categorias",
    path: "/categorias",
    label: "Categorias",
    icon: Tags,
    group: "Cadastros",
    description: "Organização de produtos por categorias e subcategorias.",
    features: ["Árvore de categorias", "Vínculo com produtos"],
  },
  {
    key: "marcas",
    path: "/marcas",
    label: "Marcas",
    icon: Award,
    group: "Cadastros",
    description: "Cadastro de marcas e fabricantes.",
    features: ["Marcas/fabricantes", "Vínculo com produtos"],
  },
  {
    key: "veiculos",
    path: "/veiculos",
    label: "Veículos",
    icon: Truck,
    group: "Cadastros",
    description: "Cadastro de veículos (autopeças / frota).",
    features: ["Placa e chassi", "Marca/modelo/ano", "Vínculo com clientes"],
  },
  {
    key: "funcionarios",
    path: "/funcionarios",
    label: "Funcionários",
    icon: Contact,
    group: "Cadastros",
    description: "Cadastro de funcionários, cargos e folha.",
    features: ["Cargos e departamentos", "Admissão e salário", "Situação (férias/afastado)"],
  },
  {
    key: "vendedores",
    path: "/vendedores",
    label: "Vendedores",
    icon: BadgeDollarSign,
    group: "Cadastros",
    description: "Vendedores, metas, comissões e ranking.",
    features: ["Metas mensais", "Comissão por %", "Ranking de desempenho"],
  },
  {
    key: "transportadoras",
    path: "/transportadoras",
    label: "Transportadoras",
    icon: Container,
    group: "Cadastros",
    description: "Transportadoras, regiões, prazos e fretes.",
    features: ["Regiões atendidas", "Prazo médio", "Frete mínimo"],
  },

  // ---- Operações ----
  {
    key: "estoque",
    path: "/estoque",
    label: "Estoque",
    icon: Warehouse,
    group: "Operações",
    description: "Controle de estoque: entradas, saídas, transferências e inventário.",
    features: ["Movimentações", "Ajustes", "Transferências", "Inventário", "Reservas"],
  },
  {
    key: "ordens-servico",
    path: "/ordens-servico",
    label: "Ordem de Serviço",
    icon: Wrench,
    group: "Operações",
    description: "Ordens de serviço: equipamentos, técnicos, peças, status e assinatura.",
    features: ["Kanban por status", "Peças com baixa de estoque", "Histórico", "Assinatura do cliente"],
  },
  {
    key: "compras",
    path: "/compras",
    label: "Compras",
    icon: Boxes,
    group: "Operações",
    description: "Pedidos de compra, cotações e entrada de XML (NF-e).",
    features: ["Pedido de compra", "Cotação", "Importação de XML", "Conferência e recebimento"],
  },
  {
    key: "vendas",
    path: "/vendas",
    label: "Vendas",
    icon: ShoppingCart,
    group: "Operações",
    description: "Vendas, cupom, NF-e e NFC-e.",
    features: ["Venda / PDV", "NF-e e NFC-e", "Descontos e comissão", "Impressão e PDF"],
  },
  {
    key: "orcamentos",
    path: "/orcamentos",
    label: "Orçamentos",
    icon: ClipboardList,
    group: "Operações",
    description: "Orçamentos, conversão em venda e envio ao cliente.",
    features: ["Duplicar orçamento", "Converter em venda", "Enviar por WhatsApp/e-mail"],
  },
  {
    key: "pedidos",
    path: "/pedidos",
    label: "Pedidos",
    icon: PackageCheck,
    group: "Operações",
    description: "Pedidos de venda em aberto e acompanhamento.",
    features: ["Status do pedido", "Faturamento", "Separação e expedição"],
  },
  {
    key: "consignacao",
    path: "/consignacao",
    label: "Consignação",
    icon: Handshake,
    group: "Operações",
    description: "Produtos em consignação, devoluções e acertos.",
    features: ["Envio consignado", "Controle de devolução", "Acerto de vendas"],
  },

  // ---- Financeiro ----
  {
    key: "contabilidade",
    path: "/contabilidade",
    label: "Contabilidade",
    icon: Scale,
    group: "Financeiro",
    description: "Plano de contas, centros de custo, lançamentos, razão e balancete.",
    features: ["Partida dobrada", "Plano de contas", "Razão", "Balancete de verificação"],
    ready: true,
  },
  {
    key: "financeiro",
    path: "/financeiro",
    label: "Financeiro",
    icon: CircleDollarSign,
    group: "Financeiro",
    description: "Contas a pagar/receber, conciliação e parcelamentos.",
    features: ["Contas a pagar", "Contas a receber", "Conciliação", "Parcelamentos"],
  },
  {
    key: "fiscal",
    path: "/fiscal",
    label: "Fiscal",
    icon: FileText,
    group: "Financeiro",
    description: "Documentos fiscais, impostos e obrigações.",
    features: ["NF-e / NFC-e", "NCM / CEST / CFOP", "SPED (futuro)"],
  },
  {
    key: "livros-fiscais",
    path: "/livros-fiscais",
    label: "Livros Fiscais",
    icon: BookMarked,
    group: "Financeiro",
    description: "Registro de entradas/saídas e apuração de ICMS/IPI.",
    features: ["Livro de entradas", "Livro de saídas", "Apuração de ICMS", "Apuração de IPI"],
    ready: true,
  },
  {
    key: "boletos",
    path: "/boletos",
    label: "Boletos",
    icon: Receipt,
    group: "Financeiro",
    description: "Emissão e gestão de boletos bancários.",
    features: ["Emissão", "Remessa e retorno", "Baixa automática"],
  },
  {
    key: "pix",
    path: "/pix",
    label: "PIX",
    icon: QrCode,
    group: "Financeiro",
    description: "Cobranças PIX com QR code estático e dinâmico.",
    features: ["QR dinâmico", "Conciliação", "Webhooks"],
  },
  {
    key: "caixa",
    path: "/caixa",
    label: "Caixa",
    icon: Landmark,
    group: "Financeiro",
    description: "Abertura/fechamento de caixa, sangrias e suprimentos.",
    features: ["Abertura e fechamento", "Sangria e suprimento", "Movimento do dia"],
  },
  {
    key: "bancos",
    path: "/bancos",
    label: "Bancos",
    icon: PiggyBank,
    group: "Financeiro",
    description: "Contas bancárias, extrato, transferências e conciliação.",
    features: ["Múltiplas contas", "Extrato", "Transferência entre contas"],
  },
  {
    key: "custos",
    path: "/custos",
    label: "Custos",
    icon: Calculator,
    group: "Financeiro",
    description: "Custos fixos, margem de contribuição e rentabilidade por produto.",
    features: ["Custos fixos por categoria", "Margem bruta e líquida", "Rentabilidade por produto"],
  },
  {
    key: "cheques",
    path: "/cheques",
    label: "Cheques",
    icon: Banknote,
    group: "Financeiro",
    description: "Controle de cheques recebidos e emitidos.",
    features: ["Recebidos e emitidos", "Em carteira / compensado", "Devoluções"],
  },
  {
    key: "cartoes",
    path: "/cartoes",
    label: "Cartão de crédito",
    icon: CreditCard,
    group: "Financeiro",
    description: "Vendas por cartão, taxas e previsão de recebimento.",
    features: ["Bandeiras e adquirentes", "Taxas e líquido", "Previsão de recebimento"],
  },

  // ---- Relacionamento ----
  {
    key: "relatorios",
    path: "/relatorios",
    label: "Relatórios",
    icon: BarChart3,
    group: "Relacionamento",
    description: "Relatórios gerenciais e exportações.",
    features: ["Vendas", "Estoque", "Financeiro", "Exportar PDF/Excel"],
  },
  {
    key: "agenda",
    path: "/agenda",
    label: "Agenda",
    icon: CalendarDays,
    group: "Relacionamento",
    description: "Agenda de compromissos e tarefas.",
    features: ["Calendário", "Lembretes", "Vínculo com clientes"],
  },
  {
    key: "crm",
    path: "/crm",
    label: "CRM",
    icon: IdCard,
    group: "Relacionamento",
    description: "Funil de vendas e relacionamento com clientes.",
    features: ["Funil / kanban", "Oportunidades", "Atividades"],
  },
  {
    key: "atendimento",
    path: "/atendimento",
    label: "Atendimento",
    icon: Headset,
    group: "Relacionamento",
    description: "Chamados de suporte pós-venda, separados do funil de CRM.",
    features: ["Inbox de chamados", "Thread de mensagens", "Prioridade e SLA", "Avaliação do cliente"],
    ready: true,
  },

  // ---- Administração ----
  {
    key: "usuarios",
    path: "/usuarios",
    label: "Usuários",
    icon: UserCog,
    group: "Administração",
    description: "Gestão de usuários do sistema.",
    features: ["Cadastro", "Ativar/desativar", "2FA"],
  },
  {
    key: "permissoes",
    path: "/permissoes",
    label: "Permissões",
    icon: ShieldCheck,
    group: "Administração",
    description: "Perfis de acesso e permissões (RBAC).",
    features: ["Perfis", "Permissões por módulo", "Vínculo usuário-perfil"],
  },
  {
    key: "logs",
    path: "/logs",
    label: "Logs",
    icon: ScrollText,
    group: "Administração",
    description: "Logs de auditoria e atividades (LGPD).",
    features: ["Trilha de auditoria", "Filtros", "Exportação"],
  },
  {
    key: "configuracoes",
    path: "/configuracoes",
    label: "Configurações",
    icon: Cog,
    group: "Administração",
    description: "Configurações da empresa e do sistema.",
    features: ["Dados da empresa", "Preferências", "Integrações fiscais"],
  },
  {
    key: "integracoes",
    path: "/integracoes",
    label: "Integrações",
    icon: Plug,
    group: "Administração",
    description: "Integrações com marketplaces, bancos e gateways.",
    features: ["Marketplaces", "Bancos", "Gateways de pagamento"],
  },
];

export const MODULES_BY_GROUP: Record<ModuleGroup, ModuleDef[]> = GROUP_ORDER.reduce(
  (acc, group) => {
    acc[group] = MODULES.filter((m) => m.group === group);
    return acc;
  },
  {} as Record<ModuleGroup, ModuleDef[]>,
);

export function findModuleByPath(path: string): ModuleDef | undefined {
  return MODULES.find((m) => m.path === path);
}
