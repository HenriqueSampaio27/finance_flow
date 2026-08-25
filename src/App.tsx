import React, { useState } from 'react';
import { NavigationTab } from './types';
import { initialBudgetItems } from './data/initialData';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardSection } from './pages/DashboardSection';
import { EntradasSection } from './pages/EntradasSection';
import { SaidasSection } from './pages/SaidasSection';
import { ContasPagarSection } from './pages/ContasPagarSection';
import { ContasReceberSection } from './pages/ContasReceberSection';
import { OrcamentoSection } from './pages/OrcamentoSection';
import { RelatoriosSection } from './pages/RelatoriosSection';
import { CadastroClienteSection } from './pages/CadastroClienteSection';
import { NovaEntradaModal } from './components/modals/NovaEntradaModal';
import { NovaSaidaModal } from './components/modals/NovaSaidaModal';
import { RelatorioRapidoModal } from './components/modals/RelatorioRapidoModal';
import { useEntries} from "./hooks/useEntries"
import { useExpenses } from './hooks/useExpenses';
import {usePayables} from "./hooks/usePayables"
import {useReceivables} from "./hooks/useReceivables"
import {useClients} from "./hooks/useClients"

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('entradas');
  const [globalSearch, setGlobalSearch] = useState('');
  const search = globalSearch.toLowerCase();
  // State collections
  
  const {
  entries,
  addEntry,
  deleteEntry,
  updateEntryStatus
  } = useEntries();
  const{
    expenses, 
    addExpense,
    deleteExpense,
    updateExpenseStatus
  } = useExpenses()
  const {
    payables,
    deletePayable,
    updatePayableStatus
  } = usePayables()
  const {
    receivables,
    deleteReceivable,
    updateReceivableStatus
  } = useReceivables()
  const {
    saveClient,
    clients
  } = useClients()

  const filteredEntries = entries.filter(
    entry => !search || entry.descricao.toLowerCase().includes(search) ||
      entry.cliente.toLowerCase().includes(search)
  );

  const filteredExpenses = expenses.filter(
    expense =>!search || expense.fornecedor.toLowerCase().includes(search) ||
      expense.obs.toLowerCase().includes(search)
  );

  const filteredPayables = payables.filter(
    payable => !search || payable.fornecedor.toLowerCase().includes(search)
  );

  const filteredReceivables = receivables.filter(
    receivable => !search || receivable.cliente.toLowerCase().includes(search)
  );

  // Modals state
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [isQuickReportOpen, setIsQuickReportOpen] = useState(false);

  const totalRecebido = entries.filter(e => e.status === 'Recebido').reduce((a, b) => a + b.valor, 0);
  const totalGasto = expenses.filter(e => e.status === 'Pago').reduce((a, b) => a + b.valor, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-row antialiased selection:bg-[#003d9b] selection:text-white">
      {/* Fixed Desktop Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewEntry={() => setIsNewEntryOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onOpenQuickReport={() => setIsQuickReportOpen(true)}
        />

        {/* Dynamic View Router */}
        <main className="flex-1 pb-16">
          {currentTab === 'dashboard' && (
            <DashboardSection
              entries={entries}
              expenses={expenses}
              payables={payables}
              receivables={receivables}
              onNavigate={setCurrentTab}
              onOpenNewEntry={() => setIsNewEntryOpen(true)}
              onOpenNewExpense={() => setIsNewExpenseOpen(true)}
            />
          )}

          {currentTab === 'entradas' && (
            <EntradasSection
              entries={filteredEntries}
              onOpenNewEntry={() => setIsNewEntryOpen(true)}
              onDeleteEntry={deleteEntry}
              onUpdateStatus={updateEntryStatus}
            />
          )}

          {currentTab === 'saidas' && (
            <SaidasSection
              expenses={filteredExpenses}
              onOpenNewExpense={() => setIsNewExpenseOpen(true)}
              onDeleteExpense={deleteExpense}
              onUpdateStatus={updateExpenseStatus}
            />
          )}

          {currentTab === 'contas-pagar' && (
            <ContasPagarSection
              payables={ filteredPayables }
              onOpenNewPayable={() => setIsNewExpenseOpen(true)}
              onDeletePayable={deletePayable}
              onUpdateStatus={updatePayableStatus}
            />
          )}

          {currentTab === 'contas-receber' && (
            <ContasReceberSection
              receivables={ filteredReceivables
              }
              onOpenNewReceivable={() => setIsNewEntryOpen(true)}
              onDeleteReceivable={deleteReceivable}
              onUpdateStatus={updateReceivableStatus}
            />
          )}

          {currentTab === 'orcamento' && (
            <OrcamentoSection
              budgetItems={initialBudgetItems}
            />
          )}

          {currentTab === 'relatorios' && (
            <RelatoriosSection
              onOpenQuickReport={() => setIsQuickReportOpen(true)}
            />
          )}

          {currentTab === 'cadastro-cliente' && (
            <CadastroClienteSection
              clients={clients}
              onSaveClient={saveClient}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <NovaEntradaModal
        isOpen={isNewEntryOpen}
        onClose={() => setIsNewEntryOpen(false)}
        onAddEntry={addEntry}
      />

      <NovaSaidaModal
        isOpen={isNewExpenseOpen}
        onClose={() => setIsNewExpenseOpen(false)}
        onAddExpense={addExpense}
      />

      <RelatorioRapidoModal
        isOpen={isQuickReportOpen}
        onClose={() => setIsQuickReportOpen(false)}
        totalRecebido={totalRecebido}
        totalGasto={totalGasto}
      />
    </div>
  );
}
