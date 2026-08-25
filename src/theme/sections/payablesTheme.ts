export const payablesTheme = {
  header: {
    title: 'Contas a Pagar',
    subtitle: 'Gerencie suas obrigações financeiras e fluxo de caixa.',
    actionLabel: '+ Novo Pagamento',
  },
  kpis: [
    {
      id: 'total',
      title: 'Total a Pagar',
      subtext: 'Próximos 30 dias',
      icon: 'Wallet',
      color: 'blue',
      borderColor: 'border-slate-200',
    },
    {
      id: 'overdue',
      title: 'Contas Vencidas',
      subtext: '08 faturas pendentes',
      icon: 'AlertCircle',
      color: 'red',
      borderColor: 'border-l-4 border-l-rose-600',
    },
    {
      id: 'dueToday',
      title: 'Vencendo Hoje',
      subtext: 'Processar até as 18h',
      icon: 'Calendar',
      color: 'slate',
      borderColor: 'border-slate-200',
    },
    {
      id: 'efficiency',
      title: 'Eficiência de Pagamento',
      subtext: '94.2%',
      icon: 'TrendingUp',
      color: 'indigo',
      borderColor: 'border-slate-200',
    }
  ],
  table: {
    columns: ['FORNECEDOR', 'DOCUMENTO', 'VENCIMENTO', 'VALOR ORIGINAL', 'VALOR PAGO', 'SALDO', 'PARCELA', 'STATUS'],
  }
};
