export type NavigationTab = 
  | 'dashboard'
  | 'entradas'
  | 'saidas'
  | 'contas-pagar'
  | 'contas-receber'
  | 'projetos'
  | 'cadastro-cliente'
  | 'config';

export type StatusRecebimento = 'Recebido' | 'Pendente' | 'Atrasado' ;
export type StatusPagamento = 'Pago' | 'Pendente' | 'Vencido' | 'Parcial';

export interface BudgetItem {
  id: string;
  categoria: string;
  iconName: 'Megaphone' | 'Server' | 'Users' | 'Plane' | 'Building' | 'Shield' | 'Package';
  previsto: number;
  realizado: number;
  diferenca: number;
  consumoPercent: number;
  statusType: 'ok' | 'warning' | 'alert' | 'info';
}

export interface MonthlyCashFlow {
  month: string;
  entradas: number;
  saidas: number;
}

export interface CategoryExpenseReport {
  categoria: string;
  porcentagem: number;
  valor: number;
  color: string;
}

export interface BankAccountInfo {
  id: string;
  nome: string;
  banco: string;
  tipo: string;
  agencia: string;
  conta: string;
  saldo: number;
  variacao: string;
  isPositive: boolean;
  color: string;
}

export interface CashFlowDataPoint {
  periodo: string;
  entradas: number;
  saidas: number;
  saldoAcumulado: number;
}
