export interface PayableItem {
  id?: number;
  date: string; // e.g. "12 Mai 2024"
  amount: number;
  supplier: string;
  category: string;
  outgoing_account: string;
  observation: string;
  installment_number: number;
  installment_total: number;
  installment_interval: number;
  status: string
}