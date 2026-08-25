export const reportsTheme = {
  header: {
    title: 'Relatórios Financeiros',
    subtitle: 'Analise o desempenho e a saúde financeira da sua empresa.',
    exportOptions: ['PDF', 'Excel', 'Imprimir'] as const,
  },
  charts: {
    cashFlow: {
      title: 'Fluxo de Caixa Mensal',
      subtitle: 'Entradas vs Saídas nos últimos 6 meses',
    },
    expensesByCategory: {
      title: 'Despesas por Categoria',
      totalLabel: 'R$45k',
    },
    dre: {
      title: 'DRE Simplificada',
    },
    revenueVsExpenses: {
      title: 'Receitas vs Despesas',
      marginLabel: 'Índice de Margem',
    }
  }
};
