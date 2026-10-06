import { apiRequest } from "./apiRequest";
import { ReceivableItem, StatusRecebimento } from "../types/receivableType";

export async function getReceivable(): Promise<ReceivableItem[]> {
  return apiRequest<ReceivableItem[]>("/accounts_receivable");
}

export async function getReceivableById(id: number): Promise<ReceivableItem> {
  return apiRequest<ReceivableItem>(`/accounts_receivable/${id}`);
}

export async function createReceivable(
  receivable: Omit<ReceivableItem, "id">
): Promise<{ message: string; receivable: ReceivableItem[] }> {
  return apiRequest<{ message: string; receivable: ReceivableItem[] }>("/accounts_receivable", {
    method: "POST",
    body: JSON.stringify(receivable),
  });
}

export async function registerPayment(
  id: number,
  paymentAmount: number,
  receipt: string,
  destination_account: string,
  fee: number
): Promise<{
  message: string;
  receivable: ReceivableItem;
}> {
  return apiRequest<{
    message: string;
    receivable: ReceivableItem;
  }>(
    `/accounts_receivable/${id}/payment`,
    {
      method: "PATCH",
      body: JSON.stringify({
        paymentAmount,
        receipt,
        destination_account,
        fee,
      }),
    }
  );
}

export async function updateReceivable(
  id: number,
  status: StatusRecebimento
): Promise<{ message: string; status: string }> {
  return apiRequest<{ message: string; status: string }>(
    `/accounts_receivable/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
}

export async function deleteReceivable(
  id: number
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/accounts_receivable/${id}`, {
    method: "DELETE",
  });
}