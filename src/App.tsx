import React, { useState } from 'react';
import { NavigationTab, Projeto2D } from './types';
import { initialBudgetItems } from './data/initialData';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardSection } from './pages/DashboardSection';
import { EntradasSection } from './pages/EntrySection';
import { ExpensesSection } from './pages/ExpensesSection';
import { AccountPayableSection } from './pages/AccountPayableSection';
import { AccountReceivableSection } from './pages/AccountReceivableSection';
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
import { BankDate } from './components/modals/BankDate';
import { PayableModal } from './components/modals/PayablesModal';
import { Projetos2DSection } from './pages/Projetos2DSection';
import { useProject } from './hooks/useProject'
import { ReceivableModal } from './components/modals/ReceivableModal';
import { ConfiguracoesSection } from './pages/ConfiguracoesSection';
import { useBanks } from './hooks/useBank';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
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
    registerPayment
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
    updateStatusProj,
    editProject
  } = useProject()
  const {
    banks,
    loadBanks
  } = useBanks();

  const filteredEntries = entries.filter(
    entry => !search || entry.description.toLowerCase().includes(search)// ||
      
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

  const [nameModalProps, setNameModalProps] = useState("Novo Recebimento")
  const [selectedProject, setSelectedProject] = useState<Projeto2D | undefined>();

  const handleOpenReceivable = (project: Projeto2D) => {
    setSelectedProject(project);
  };

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
           {currentTab === 'dashboard' && (
            <DashboardSection
              entries={entries}
              expenses={expenses}
              payables={payable}
              clients={clients}
              receivables={receivables}
              user={user}
              bank={banks}
              project={project}
              onNavigate={setCurrentTab}
              onOpenNewEntry={() => setIsNewEntryOpen(true)}
              onOpenNewExpense={() => setIsNewExpenseOpen(true)}
            />
          )}

          {currentTab === 'entradas' && (
            <EntradasSection
              entries={entries}
              onOpenNewEntry={() => setIsNewEntryOpen(true)}
              onDeleteEntry={deleteEntryId}
              user={user}
              client={clients}
              bank={banks}
            />
          )}

          {currentTab === 'saidas' && (
            <ExpensesSection
              expenses={filteredExpenses}
              onOpenNewExpense={() => setIsNewExpenseOpen(true)}
              onDeleteExpense={deleteExpenseId}
              user={user}
              bank={banks}
            />
          )}

          {currentTab === 'contas-pagar' && (
            <AccountPayableSection
              payables={ payable }
              onOpenNewPayable={() => setIsNewPayableOpen(true)}
              onDeletePayable={deletePayableId}
              onUpdateStatus={registerPayment}
              user={user}
              onExpensePayable={loadExpenses}
              bank={banks}
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
              modalProps = {() => setNameModalProps("Novo Recebimento")}
              bank={banks}
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
            modalProps = {() => setNameModalProps("Novo Registro")}
            onOpenNewReceivable={() => setIsNewReceivableOpen(true)}
            projectSelect={handleOpenReceivable}
            />
          )}

          {currentTab === 'cadastro-cliente' && (
            <CadastroClienteSection
              clients={clients}
              onSaveClient={saveClient}
            />
          )}

          {currentTab === 'config' && (
            <ConfiguracoesSection
              user={user}
              onUpdate={saveUser}
              load={loadBanks}
            />
          )}
        </main>
      </div>

      {user && (<EntryModal
        isOpen={isNewEntryOpen}
        onClose={() => setIsNewEntryOpen(false)}
        onAddEntry={saveEntries}
        user={user}
        client={clients}
        bank={banks}
      />)}

      <ReceivableModal
        isOpen={isNewReceivableOpen}
        onClose={() => setIsNewReceivableOpen(false)}
        onAddReceivable={saveReceivables}
        client={clients}
        modalName={nameModalProps}
        projectReceipt={selectedProject}
        onUpdateProject={updateStatusProj}
      />

      <ExpensesModal
        isOpen={isNewExpenseOpen}
        onClose={() => setIsNewExpenseOpen(false)}
        onAddExpense={saveExpense}
        user={user}
        bank={banks}
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
