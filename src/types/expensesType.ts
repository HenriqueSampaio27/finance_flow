export interface ExpenseItem {
  id?: number;
  date: string; // e.g. "12 Mai 2024"
  amount: number;
  supplier: string;
  category: string;
  outgoing_account: string;
  observations: string;
  installment: string;
}