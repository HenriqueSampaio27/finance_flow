import { apiRequest } from "./apiRequest";
import { EntryItem } from "../types/entryType";

export async function getEntry(): Promise<EntryItem[]> {
  return apiRequest<EntryItem[]>("/entry");
}

export async function getEntryById(id: number): Promise<EntryItem> {
  return apiRequest<EntryItem>(`/entry/${id}`);
}

export async function createEntry(
  entry: Omit<EntryItem, "id">
): Promise<{ message: string; entry: EntryItem }> {
  return apiRequest<{ message: string; entry: EntryItem }>("/entry", {
    method: "POST",
    body: JSON.stringify(entry),
  });
}

export async function updateEntry(
  id: number,
  status: string
): Promise<{ message: string; status: string }> {
  return apiRequest<{ message: string; status: string }>(
    `/entry/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({status}),
    }
  );
}

export async function deleteEntry(
  id: number
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/entry/${id}`, {
    method: "DELETE",
  });
}