import React from 'react';
import { 
  LayoutGrid, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CalendarDays, 
  Receipt, 
  TrendingUp, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Plus,
  UserPlus
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenNewEntry: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewEntry
}) => {
  const menuItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutGrid },
    { id: 'entradas' as NavigationTab, label: 'Entradas', icon: ArrowDownLeft },
    { id: 'saidas' as NavigationTab, label: 'Saídas', icon: ArrowUpRight },
    { id: 'contas-pagar' as NavigationTab, label: 'Contas a Pagar', icon: CalendarDays },
    { id: 'contas-receber' as NavigationTab, label: 'Contas a Receber', icon: Receipt },
    { id: 'orcamento' as NavigationTab, label: 'Orçamento', icon: TrendingUp },
    { id: 'relatorios' as NavigationTab, label: 'Relatórios', icon: BarChart3 },
    { id: 'cadastro-cliente' as NavigationTab, label: 'Cadastro de Cliente', icon: UserPlus },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-20">
      <div className="p-5 flex flex-col">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6 px-1">
          <div className="w-9 h-9 rounded-lg bg-[#003d9b] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            F
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-none flex items-center">
              Finance<span className="text-[#003d9b]">Flow</span>
            </h1>
            <p className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
              Raynex Solutions
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-6">
          <button
            id="sidebar-new-entry-btn"
            onClick={onOpenNewEntry}
            className="w-full bg-[#003d9b] hover:bg-[#003080] active:scale-[0.98] text-white text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Relatorio</span>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left relative cursor-pointer ${
                  isActive
                    ? 'text-[#003d9b] bg-slate-50 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#003d9b] stroke-[2.3]' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="absolute right-0 top-1.5 bottom-1.5 w-1 bg-[#003d9b] rounded-l-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="space-y-1">
          <button 
            onClick={() => onSelectTab('dashboard')}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Configurações</span>
          </button>
          
        </div>

        {/* User profile card */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden ring-1 ring-slate-300/80 shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
              alt="Admin User" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-semibold text-slate-800 leading-tight truncate">Admin User</p>
            <p className="text-[11px] text-slate-400 leading-tight truncate">accountant@flow.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
