import { apiRequest } from "./apiRequest";
import { ExpenseItem } from "../types/expensesType";

export async function getExpense(): Promise<ExpenseItem[]> {
  return apiRequest<ExpenseItem[]>("/expense");
}

export async function getExpenseById(id: number): Promise<ExpenseItem> {
  return apiRequest<ExpenseItem>(`/expense/${id}`);
}

export async function createExpense(
  expense: Omit<ExpenseItem, "id">
): Promise<{ message: string; expense: ExpenseItem }> {
    return apiRequest<{ message: string; expense: ExpenseItem }>("/expense", {
    method: "POST",
    body: JSON.stringify(expense),
  });
  
}

export async function deleteExpense(
  id: number
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/expense/${id}`, {
    method: "DELETE",
  });
}