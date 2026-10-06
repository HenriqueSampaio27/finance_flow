export const receivablesTheme = {
  header: {
    title: 'Contas a Receber',
    subtitle: 'Gestão de recebíveis e acompanhamento de inadimplência.',
    actionLabel: 'Conta a Receber',
  },
  kpis: {
    total: {
      label: 'TOTAL A RECEBER (MÊS)',
      trend: '+12.5% vs. mês passado',
    },
    overdue: {
      label: 'CONTAS EM ATRASO',
      subtext: '14 títulos vencidos',
      badgeBg: 'bg-rose-50',
      textColor: 'text-rose-600',
    },
    today: {
      label: 'RECEBIMENTOS HOJE',
      subtext: '3 títulos programados',
    }
  },
  table: {
    columns: ['CLIENTE', 'DOCUMENTO', 'VENCIMENTO', 'VALOR ORIGINAL', 'VALOR RECEBIDO', 'SALDO', 'PARCELA', 'STATUS'],
  }
};
