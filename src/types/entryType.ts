
export interface EntryItem {
  id?: number;
  date: string | "28/08/2028";
  amount: number;
  description: string;
  category: string;
  client_id: number | null;
  receipt: string;
  destination_account: string;
  installment: string
  fee: number;
}