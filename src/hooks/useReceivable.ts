import { useEffect, useState } from 'react';
import {
  ReceivableItem,
  StatusRecebimento,
} from "../types/receivableType";
import {
  getReceivable,
  createReceivable,
  deleteReceivable,
  getReceivableById,
  registerPayment,
  updateReceivable
} from '../services/receivableService';

export function useReceivables() {
  const [receivables, setReceivables] = useState<ReceivableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReceivable = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getReceivable();

      setReceivables(data);
    } catch (error) {
      console.error("Erro ao buscar recebimentos:", error);

      setError("Não foi possível carregar os recebimentos.");
    } finally {
      setLoading(false);
    }
  };

  const saveReceivables = async (
    receivable: Omit<ReceivableItem, "id">
    ) => {
    try {
        setError(null);

        const response = await createReceivable(receivable);

        setReceivables((prev) => [
        ...response.receivable,
        ...prev,
        ]);

        return response.receivable;
    } catch (error) {
        console.error("Erro ao salvar recebimento:", error);

        setError("Não foi possível salvar o recebimento.");

        throw error;
    }
    };

  const deleteReceivableId = async (id: number) => {
    try {
      setError(null);

      await deleteReceivable(id);

      setReceivables((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (error) {
      setError("Não foi possível deletar o recebimento.");
      throw error;
    }
  };

    const payReceivable = async (
        id: number,
        paymentAmount: number,
        receipt: string,
        destination_account: string,
        fee: number
        ) => {
        try {
            setError(null);

            const response = await registerPayment(
            id,
            paymentAmount,
            receipt,
            destination_account,
            fee
            );

            setReceivables((prev) =>
            prev.map((item) =>
                item.id === id
                ? response.receivable
                : item
            )
            );

            return response.receivable;
        } catch (error) {
            console.error("Erro ao registrar pagamento:", error);

            setError(
            error instanceof Error
                ? error.message
                : "Não foi possível registrar o pagamento."
            );

            throw error;
        }
        };

  const handleUpdateReceivable = async (
    id: number,
    status: StatusRecebimento
  ) => {
    try {
      setError(null);

      await updateReceivable(id, status);

      // Atualiza somente o item alterado na lista
      setReceivables((current) =>
        current.map((receivable) =>
          receivable.id === id
            ? {
                ...receivable,
                status,
              }
            : receivable
        )
      );

      return true;
    } catch (err) {
      console.error("Erro ao atualizar conta a receber:", err);
      setError("Erro ao atualizar conta a receber.");

      return false;
    }
  };

  useEffect(() => {
    loadReceivable();
  }, []);

  return {
    receivables,
    loadReceivable,
    deleteReceivableId,
    saveReceivables,
    loading,
    error,
    handleUpdateReceivable,
    payReceivable
  };
}