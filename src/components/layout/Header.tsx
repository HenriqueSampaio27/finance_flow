import React from 'react';
import { Search, Bell, Settings, FileSpreadsheet } from 'lucide-react';
import { UserType } from '@/src/types/userType';
import { title_div_one, title_div_two } from '@/src/types/titleFinanceFlow';

interface HeaderProps {
  onOpenQuickReport: () => void;
  onOpenConfig: () => void;
  user: UserType | null | undefined
}

export const Header: React.FC<HeaderProps> = ({
  
  onOpenQuickReport,
  onOpenConfig,
  user
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-6 flex-1 max-w-xl">
        <h2 className="text-base font-bold text-slate-800 tracking-tight hidden sm:block shrink-0">
          {title_div_one} <span className="text-[#003d9b]">{title_div_two}</span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button
          id="btn-relatorio-rapido"
          onClick={onOpenQuickReport}
          className="hidden md:inline-flex items-center gap-2 bg-[#003d9b] hover:bg-[#003080] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Relatório Rápido</span>
        </button>

        <button 
          id="header-bell-btn"
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          title="Notificações"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        <button 
          id="header-settings-btn"
          onClick={onOpenConfig}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          title="Configurações"
        >
          <Settings className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-900 leading-tight">{user? user.name: ""}</p>
            <p className="text-[11px] text-slate-400 font-medium">Plan: Premium</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden ring-1 ring-slate-300">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" 
              alt="Admin Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
