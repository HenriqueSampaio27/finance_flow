import { apiRequest } from "./apiRequest";
import { ClientItem } from "../types/clientType";

export async function getClients(): Promise<ClientItem[]> {
  return apiRequest<ClientItem[]>("/clients");
}

export async function getClientById(id: number): Promise<ClientItem> {
  return apiRequest<ClientItem>(`/clients/${id}`);
}

export async function createClient(
  client: Omit<ClientItem, "id">
): Promise<{ message: string; client: ClientItem }> {
  return apiRequest<{ message: string; client: ClientItem }>("/clients", {
    method: "POST",
    body: JSON.stringify(client),
  });
}

export async function updateClient(
  id: number,
  client: Omit<ClientItem, "id">
): Promise<{ message: string; client: ClientItem }> {
  return apiRequest<{ message: string; client: ClientItem }>(
    `/clients/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(client),
    }
  );
}

export async function deleteClient(
  id: number
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/clients/${id}`, {
    method: "DELETE",
  });
}