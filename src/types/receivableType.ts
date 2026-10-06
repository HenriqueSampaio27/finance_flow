export type StatusRecebimento = 'received' | 'pending' | 'late' | 'canceled' | 'partial' | 'paid';

export interface ReceivableItem {
  id: number;
  client_id: number;
  document_id: string;
  entry_date: string;
  due_date: string;
  original_amount: number;
  received_amount: number;
  balance: number;
  installment: string;
  status: StatusRecebimento;
}