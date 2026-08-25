export const entriesTheme = {
  header: {
    title: 'Entradas Financeiras',
    subtitle: 'Gerencie e visualize todo o fluxo de caixa recebido da sua empresa.',
    actionLabel: '+ Nova Entrada',
  },
  kpiCards: {
    totalReceived: {
      label: 'TOTAL RECEBIDO (MÊS)',
      trend: '+12.5% vs. mês anterior',
      trendType: 'positive' as const,
      color: 'emerald',
    },
    pending: {
      label: 'PENDENTE DE RECEBIMENTO',
      sublabel: '14 faturas em aberto',
      color: 'blue',
    },
    averageTicket: {
      label: 'TICKET MÉDIO POR CLIENTE',
      trend: '-2.1% oscilação semanal',
      trendType: 'neutral' as const,
      color: 'purple',
    }
  },
  table: {
    columns: ['DATA', 'DESCRIÇÃO', 'CATEGORIA', 'CLIENTE', 'RECEBIMENTO', 'CONTA', 'VALOR', 'STATUS', 'AÇÕES'],
  }
};
