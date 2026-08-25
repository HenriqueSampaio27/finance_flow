export type NavigationTab = 
  | 'dashboard'
  | 'entradas'
  | 'saidas'
  | 'contas-pagar'
  | 'contas-receber'
  | 'orcamento'
  | 'relatorios'
  | 'cadastro-cliente';

export type StatusRecebimento = 'Recebido' | 'Pendente' | 'Atrasado' | 'Cancelado';
export type StatusPagamento = 'Pago' | 'Pendente' | 'Vencido' | 'Agendado' | 'Parcial';

export interface EntryItem {
  id: string;
  data: string;
  descricao: string;
  categoria: string;
  cliente: string;
  recebimento: 'Transferência' | 'Pix' | 'Boleto' | 'Cartão' | 'Dinheiro';
  conta: 'Itaú PJ' | 'NuBank PJ' | 'Caixa Interno' | 'Bradesco' | 'Santander';
  valor: number;
  status: StatusRecebimento;
}

export interface ExpenseItem {
  id: string;
  data: string; // e.g. "12 Mai 2024"
  fornecedor: string;
  avatarLetter: string;
  avatarBgColor?: string;
  categoria: string;
  conta: string;
  valor: number;
  status: StatusPagamento;
  obs: string;
  temAnexo: boolean;
}

export interface PayableItem {
  id: string;
  fornecedor: string;
  avatarLetter: string;
  documento: string;
  vencimento: string; // e.g. "12/11/2023"
  vencimentoTag?: string; // e.g. "VENCIDO HÁ 4 DIAS", "VENCE HOJE"
  valorOriginal: number;
  valorPago: number;
  saldo: number;
  parcela: string;
  status: StatusPagamento;
}

export interface ReceivableItem {
  id: string;
  cliente: string;
  documento: string;
  vencimento: string;
  valorOriginal: number;
  valorRecebido: number;
  saldo: number;
  parcela: string;
  isStriked?: boolean;
  status: StatusRecebimento;
}

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

export interface ClientItem {
  id: string;
  nome: string;
  cpfCnpj: string;
  inscricaoEstadual?: string;
  email: string;
  telefone: string;
  responsavel: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  limiteCredito: number;
  condicaoPagamento: string;
  observacoes?: string;
  createdAt: string;
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
