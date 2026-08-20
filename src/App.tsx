import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { MODULES } from "@/config/modules";
import { AgendaPage } from "@/features/agenda/agenda-page";
import { AtendimentoPage } from "@/features/atendimento/atendimento-page";
import { LoginPage } from "@/features/auth/login-page";
import { BancosPage } from "@/features/bancos/bancos-page";
import { BoletosPage } from "@/features/boletos/boletos-page";
import { CaixaPage } from "@/features/caixa/caixa-page";
import { CartoesPage } from "@/features/cartoes/cartoes-page";
import { CategoriasPage } from "@/features/categorias/categorias-page";
import { ChequesPage } from "@/features/cheques/cheques-page";
import { ClientesPage } from "@/features/clientes/clientes-page";
import { ComprasPage } from "@/features/compras/compras-page";
import { ConfiguracoesPage } from "@/features/configuracoes/configuracoes-page";
import { ConsignacaoPage } from "@/features/consignacao/consignacao-page";
import { ContabilidadePage } from "@/features/contabilidade/contabilidade-page";
import { CrmPage } from "@/features/crm/crm-page";
import { CustosPage } from "@/features/custos/custos-page";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { EstoquePage } from "@/features/estoque/estoque-page";
import { FinanceiroPage } from "@/features/financeiro/financeiro-page";
import { FiscalPage } from "@/features/fiscal/fiscal-page";
import { FornecedoresPage } from "@/features/fornecedores/fornecedores-page";
import { FuncionariosPage } from "@/features/funcionarios/funcionarios-page";
import { IntegracoesPage } from "@/features/integracoes/integracoes-page";
import { LivrosFiscaisPage } from "@/features/livros-fiscais/livros-fiscais-page";
import { LogsPage } from "@/features/logs/logs-page";
import { MarcasPage } from "@/features/marcas/marcas-page";
import { ModulePage } from "@/features/misc/module-page";
import { OrcamentosPage } from "@/features/orcamentos/orcamentos-page";
import { OrdemServicoDetalhePage } from "@/features/ordens-servico/ordem-servico-detalhe-page";
import { OrdensServicoPage } from "@/features/ordens-servico/ordens-servico-page";
import { PedidosPage } from "@/features/pedidos/pedidos-page";
import { PermissoesPage } from "@/features/permissoes/permissoes-page";
import { PixPage } from "@/features/pix/pix-page";
import { ProdutosPage } from "@/features/produtos/produtos-page";
import { RelatoriosPage } from "@/features/relatorios/relatorios-page";
import { TransportadorasPage } from "@/features/transportadoras/transportadoras-page";
import { UsuariosPage } from "@/features/usuarios/usuarios-page";
import { VendasPage } from "@/features/vendas/vendas-page";
import { VendedoresPage } from "@/features/vendedores/vendedores-page";
import { VeiculosPage } from "@/features/veiculos/veiculos-page";

/** Mapeia a chave do modulo para sua pagina. */
const PAGES: Record<string, ReactNode> = {
  dashboard: <DashboardPage />,
  clientes: <ClientesPage />,
  fornecedores: <FornecedoresPage />,
  produtos: <ProdutosPage />,
  categorias: <CategoriasPage />,
  marcas: <MarcasPage />,
  veiculos: <VeiculosPage />,
  funcionarios: <FuncionariosPage />,
  vendedores: <VendedoresPage />,
  transportadoras: <TransportadorasPage />,
  estoque: <EstoquePage />,
  "ordens-servico": <OrdensServicoPage />,
  compras: <ComprasPage />,
  vendas: <VendasPage />,
  orcamentos: <OrcamentosPage />,
  pedidos: <PedidosPage />,
  consignacao: <ConsignacaoPage />,
  contabilidade: <ContabilidadePage />,
  financeiro: <FinanceiroPage />,
  fiscal: <FiscalPage />,
  "livros-fiscais": <LivrosFiscaisPage />,
  boletos: <BoletosPage />,
  pix: <PixPage />,
  caixa: <CaixaPage />,
  bancos: <BancosPage />,
  custos: <CustosPage />,
  cheques: <ChequesPage />,
  cartoes: <CartoesPage />,
  relatorios: <RelatoriosPage />,
  agenda: <AgendaPage />,
  crm: <CrmPage />,
  atendimento: <AtendimentoPage />,
  usuarios: <UsuariosPage />,
  permissoes: <PermissoesPage />,
  logs: <LogsPage />,
  configuracoes: <ConfiguracoesPage />,
  integracoes: <IntegracoesPage />,
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/ordens-servico/:id" element={<OrdemServicoDetalhePage />} />
          {MODULES.map((mod) => (
            <Route
              key={mod.path}
              path={mod.path}
              element={PAGES[mod.key] ?? <ModulePage module={mod} />}
            />
          ))}
        </Route>
      </Route>
    </Routes>
  );
}
