import { useEffect, useState } from "react";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from "../services/clientService";

import { ClientItem } from "../types/clientType";

export function useClients() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar clientes
  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getClients();

      setClients(data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);

      setError("Não foi possível carregar os clientes.");
    } finally {
      setLoading(false);
    }
  };

  // Criar cliente
  const saveClient = async (
    client: Omit<ClientItem, "id">
  ) => {
    try {
      setError(null);

      const response = await createClient(client);

      setClients((prev) => [
        response.client,
        ...prev,
      ]);

      return response.client;

    } catch (error) {
      console.error("Erro ao salvar cliente:", error);

      setError("Não foi possível salvar o cliente.");

      throw error;
    }
  };

  // Atualizar cliente
  const editClient = async (
    id: number,
    client: Omit<ClientItem, "id">
  ) => {
    try {
      setError(null);

      const response = await updateClient(id, client);

      setClients((prev) =>
        prev.map((item) =>
          item.id === id
            ? response.client
            : item
        )
      );

      return response.client;

    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);

      setError("Não foi possível atualizar o cliente.");

      throw error;
    }
  };

  // Excluir cliente
  const removeClient = async (id: number) => {
    try {
      setError(null);

      await deleteClient(id);

      setClients((prev) =>
        prev.filter((item) => item.id !== id)
      );

    } catch (error) {
      console.error("Erro ao excluir cliente:", error);

      setError("Não foi possível excluir o cliente.");

      throw error;
    }
  };

  // Carrega os clientes quando o hook é utilizado
  useEffect(() => {
    loadClients();
  }, []);

  return {
    clients,
    loading,
    error,

    loadClients,
    saveClient,
    editClient,
    removeClient,
  };
}