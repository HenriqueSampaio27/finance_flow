export const styles = {
  // Main Layout
  pageContainer: 'p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6',
  card: 'bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden',
  cardPadded: 'bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6',
  
  // Buttons
  primaryButton: 'inline-flex items-center justify-center gap-2 bg-[#003d9b] hover:bg-[#003080] active:bg-[#002566] text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
  secondaryButton: 'inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 active:bg-slate-100 text-sm font-medium px-4 py-2 rounded-lg border border-slate-200 shadow-sm transition-all duration-150 cursor-pointer',
  ghostButton: 'inline-flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer',
  
  // Inputs & Selects
  input: 'w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20 focus:border-[#003d9b] transition-colors placeholder:text-slate-400',
  select: 'px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20 focus:border-[#003d9b] cursor-pointer shadow-sm',
  
  // Filter Bar Container
  filterBar: 'bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4',
  
  // Status Badges
  statusBadges: {
    Recebido: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    Pago: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    Pendente: 'bg-amber-50 text-amber-700 border border-amber-200/60',
    Atrasado: 'bg-rose-50 text-rose-700 border border-rose-200/60',
    Vencido: 'bg-rose-600 text-white font-medium',
    Agendado: 'bg-slate-100 text-slate-700 border border-slate-200',
    Parcial: 'bg-sky-50 text-sky-700 border border-sky-200',
  },
  
  // Category Pill
  categoryPill: 'text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/70',
  
  // Account Badges (Bank dot indicator)
  bankAccount: {
    'Itaú PJ': 'inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium',
    'NuBank PJ': 'inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium',
    'Caixa Interno': 'inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium',
  }
};
