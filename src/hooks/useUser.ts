import { useEffect, useState } from "react";
import {
  getUser,
  updateUser,
} from "../services/userService";

import { UserType } from "../types/userType";

export function useUser() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getUser();

      setUser(data);

    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      setError("Não foi possível carregar o usuário.");
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async (
    data: Omit<UserType, "id">
  ) => {
    try {
      if (!user?.id) {
        throw new Error("Usuário não encontrado");
      }

      const response = await updateUser(user.id, data);

      setUser(response.user);

      return response.user;

    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw error;
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return {
    user,
    loading,
    error,
    loadUser,
    saveUser
  };
}