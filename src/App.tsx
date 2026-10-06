import React, { useState } from 'react';
import { NavigationTab } from './types';
import { initialBudgetItems } from './data/initialData';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardSection } from './pages/DashboardSection';
import { EntradasSection } from './pages/EntrySection';
import { ExpensesSection } from './pages/ExpensesSection';
import { AccountPayableSection } from './pages/AccountPayableSection';
import { AccountReceivableSection } from './pages/AccountReceivableSection';
import { RelatoriosSection } from './pages/RelatoriosSection';
import { CadastroClienteSection } from './pages/CadastroClienteSection';
import { EntryModal } from './components/modals/EntryModal';
import { ExpensesModal } from './components/modals/ExpensesModal';
import { RelatorioRapidoModal } from './components/modals/RelatorioRapidoModal';
import { useEntries} from "./hooks/useEntries"
import { useExpenses } from './hooks/useExpenses';
import {usePayable} from "./hooks/usePayables"
import {useClients} from "./hooks/useClients"
import {useUser} from "./hooks/useUser"
import {useReceivables} from "./hooks/useReceivable"
import { UserModal } from './components/modals/ConfigModal';
import { PayableModal } from './components/modals/PayablesModal';
import { Projetos2DSection } from './pages/Projetos2DSection';
import { useProject } from './hooks/useProject'
import { ReceivableModal } from './components/modals/ReceivableModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('entradas');
  const [globalSearch, setGlobalSearch] = useState('');
  const search = globalSearch.toLowerCase();
  // State collections
  
  const {
  entries,
  loadEntry,
  deleteEntryId,
  saveEntries
  } = useEntries();
  const{
    expenses, 
    loadExpenses,
    deleteExpenseId,
    saveExpense
  } = useExpenses()
  const {
    payable,
    deletePayableId,
    savePayable,
    loadPayable,
    updateStatus
  } = usePayable()
  const {
    receivables,
    deleteReceivableId,
    loadReceivable,
    saveReceivables,
    handleUpdateReceivable,
    payReceivable
  } = useReceivables()
  const {
    saveClient,
    clients
  } = useClients()
  const {
    saveUser,
    loadUser,
    error,
    loading,
    user
  } = useUser()
  const {
    loadProject,
    saveProject,
    project,
    deleteProjectId,
    editProject
  } = useProject()

  const filteredEntries = entries.filter(
    entry => !search || entry.description.toLowerCase().includes(search)// ||
      //entry.cliente_id.toLowerCase().includes(search)
  );

  const filteredExpenses = expenses.filter(
    expense =>!search || expense.supplier.toLowerCase().includes(search) ||
      expense.observations.toLowerCase().includes(search)
  );

  const filteredPayables = payable.filter(
    payables => !search || payables.supplier.toLowerCase().includes(search)
  );

  //const filteredReceivables = receivables.filter(
  //  receivable => !search || receivable.cliente.toLowerCase().includes(search)
  //);

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [isNewPayableOpen, setIsNewPayableOpen] = useState(false);
  const [isQuickReportOpen, setIsQuickReportOpen] = useState(false);
  const [isNewReceivableOpen, setIsNewReceivableOpen] = useState(false);

  const totalGasto = 0 //expenses.filter(e => e.status === 'Pago').reduce((a, b) => a + b.valor, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-row antialiased selection:bg-[#003d9b] selection:text-white">
      {/* Fixed Desktop Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewEntry={() => setIsNewEntryOpen(true)}
        onOpenConfig={() => setIsUserModalOpen(true)}
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onOpenQuickReport={() => setIsQuickReportOpen(true)}
          onOpenConfig={() => setIsUserModalOpen(true)}
          user={user}
        />

        {/* Dynamic View Router */}
        <main className="flex-1 pb-16">
          {/* {currentTab === 'dashboard' && (
            <DashboardSection
              entries={entries}
              expenses={expenses}
              //payables={payable}
              receivables={receivables}
              onNavigate={setCurrentTab}
              onOpenNewEntry={() => setIsNewEntryOpen(true)}
              onOpenNewExpense={() => setIsNewExpenseOpen(true)}
            />
          )} */}

          {currentTab === 'entradas' && (
            <EntradasSection
              entries={entries}
              onOpenNewEntry={() => setIsNewEntryOpen(true)}
              onDeleteEntry={deleteEntryId}
              user={user}
            />
          )}

          {currentTab === 'saidas' && (
            <ExpensesSection
              expenses={filteredExpenses}
              onOpenNewExpense={() => setIsNewExpenseOpen(true)}
              onDeleteExpense={deleteExpenseId}
              user={user}
            />
          )}

          {currentTab === 'contas-pagar' && (
            <AccountPayableSection
              payables={ payable }
              onOpenNewPayable={() => setIsNewPayableOpen(true)}
              onDeletePayable={deletePayableId}
              onUpdateStatus={updateStatus}
            />
          )}

          {currentTab === 'contas-receber' && (
            <AccountReceivableSection
              receivables={receivables}
              onOpenNewReceivable={() => setIsNewReceivableOpen(true)}
              onDeleteReceivable={deleteReceivableId}
              onUpdateStatus={payReceivable}
              clients={clients}
              user={user}
              onEntryCreated={loadEntry}
            />
          )}

          { currentTab === 'projetos' && (
            <Projetos2DSection
            clients={clients}
            project={project}
            onAddProject={saveProject}
            onDeleteProject={deleteProjectId}
            loadProject={loadProject}
            updateProject={editProject}
            userName={user}
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
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={user}
        onUpdate={saveUser}
      />

      {user && (<EntryModal
        isOpen={isNewEntryOpen}
        onClose={() => setIsNewEntryOpen(false)}
        onAddEntry={saveEntries}
        user={user}
        client={clients}
      />)}

      <ReceivableModal
        isOpen={isNewReceivableOpen}
        onClose={() => setIsNewReceivableOpen(false)}
        onAddReceivable={saveReceivables}
        client={clients}
      />

      <ExpensesModal
        isOpen={isNewExpenseOpen}
        onClose={() => setIsNewExpenseOpen(false)}
        onAddExpense={saveExpense}
        user={user}
      />

      <PayableModal
      isOpen = {isNewPayableOpen}
      onClose={() => setIsNewPayableOpen(false)}
      onAddPayable={savePayable}
      user={user}
      />

      <RelatorioRapidoModal
        isOpen={isQuickReportOpen}
        onClose={() => setIsQuickReportOpen(false)}
        totalGasto={totalGasto}
      />

      
    </div>
  );
}
