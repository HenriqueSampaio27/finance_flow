import { useCallback, useEffect, useState } from "react";

import {
  getBanks,
  createBank,
  updateBank,
  deleteBank,
} from "../services/bankService";

import { Bank_account } from "../types/userType";

export function useBanks() {
  const [banks, setBanks] = useState<Bank_account[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar todas as contas bancárias
  const loadBanks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getBanks();

      setBanks(data);
    } catch (error) {
      console.error("Erro ao carregar contas bancárias:", error);

      setError("Não foi possível carregar as contas bancárias.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Cadastrar uma nova conta bancária
  const createBankAccount = async (
    data: Omit<Bank_account, "id">
  ) => {
    try {
      setSaving(true);
      setError(null);

      const response = await createBank(data);

      setBanks((current) =>
        [...current, response.bank].sort((a, b) => a.id - b.id)
      );

      return response.bank;
    } catch (error) {
      console.error("Erro ao cadastrar conta bancária:", error);

      setError("Não foi possível cadastrar a conta bancária.");

      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Atualizar uma conta bancária existente
  const saveBank = async (
    id: number,
    data: Omit<Bank_account, "id">
  ) => {
    try {
      setSaving(true);
      setError(null);

      const response = await updateBank(id, data);

      setBanks((current) =>
        current.map((bank) =>
          bank.id === id ? response.bank : bank
        )
      );

      return response.bank;
    } catch (error) {
      console.error("Erro ao atualizar conta bancária:", error);

      setError("Não foi possível atualizar a conta bancária.");

      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Excluir uma conta bancária
  const removeBank = async (id: number) => {
    try {
      setSaving(true);
      setError(null);

      await deleteBank(id);

      setBanks((current) =>
        current.filter((bank) => bank.id !== id)
      );
    } catch (error) {
      console.error("Erro ao excluir conta bancária:", error);

      setError("Não foi possível excluir a conta bancária.");

      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Carregar as contas ao inicializar o hook
  useEffect(() => {
    void loadBanks();
  }, [loadBanks]);

  return {
    banks,
    loading,
    saving,
    error,
    loadBanks,
    createBankAccount,
    saveBank,
    removeBank,
  };
}