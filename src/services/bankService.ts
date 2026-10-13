import { apiRequest } from "./apiRequest";
import { Bank_account } from "../types/userType";

interface BankResponse {
  message: string;
  bank: Bank_account;
}

export async function getBanks(): Promise<Bank_account[]> {
  return apiRequest<Bank_account[]>("/bank");
}

export async function getBankById(id: number): Promise<Bank_account> {
  return apiRequest<Bank_account>(`/bank/${id}`);
}

export async function createBank(
  bank: Omit<Bank_account, "id">
): Promise<BankResponse> {
  return apiRequest<BankResponse>("/bank", {
    method: "POST",
    body: JSON.stringify(bank),
  });
}

export async function updateBank(
  id: number,
  bank: Omit<Bank_account, "id">
): Promise<BankResponse> {
  return apiRequest<BankResponse>(`/bank/${id}`, {
    method: "PUT",
    body: JSON.stringify(bank),
  });
}

export async function deleteBank(
  id: number
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/bank/${id}`, {
    method: "DELETE",
  });
}