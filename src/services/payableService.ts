import { apiRequest } from "./apiRequest";
import { PayableItem } from "../types/payablesType";

export async function getPayable(): Promise<PayableItem[]> {
  return apiRequest<PayableItem[]>("/payable");
}

export async function getPayableById(id: number): Promise<PayableItem> {
  return apiRequest<PayableItem>(`/payable/${id}`);
}

export async function createPayable(
  payable: Omit<PayableItem, "id">
): Promise<{
  message: string;
  payable: PayableItem[];
}> {
  return apiRequest<{
    message: string;
    payable: PayableItem[];
  }>("/payable", {
    method: "POST",
    body: JSON.stringify(payable),
  });
}

export async function updatePayableStatus(
  id: number,
  status: string
): Promise<{
  message: string;
  payable: PayableItem;
}> {
  return apiRequest<{
    message: string;
    payable: PayableItem;
  }>(`/payable/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function deletePayable(
  id: number
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/payable/${id}`, {
    method: "DELETE",
  });
}