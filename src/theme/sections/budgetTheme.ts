export const budgetTheme = {
  header: {
    title: 'Planejamento Orçamentário',
    subtitle: 'Acompanhe e ajuste o orçamento por categoria.',
    defaultMonth: 'Novembro 2023',
  },
  kpis: {
    budgeted: {
      title: 'Total Previsto',
      badge: 'Orçado',
      icon: 'Layers',
    },
    spent: {
      title: 'Total Realizado',
      badge: 'Gasto',
      icon: 'CreditCard',
      progressColor: 'bg-[#003d9b]',
    },
    available: {
      title: 'Disponível',
      badge: 'Saldo',
      statusBadge: 'Dentro do limite',
      icon: 'PiggyBank',
      borderLeft: 'border-l-4 border-l-[#003d9b]',
    }
  },
  table: {
    columns: ['CATEGORIA', 'PREVISTO', 'REALIZADO', 'DIFERENÇA', 'CONSUMO', 'STATUS'],
  }
};
