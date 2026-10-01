import { useEffect, useState } from "react"; 
import {ExpenseItem} from '../types/expensesType'
import { createExpense, getExpense, deleteExpense } from "../services/expensesService";


export function useExpenses(){
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            setError(null);
        
            const data = await getExpense();
        
            setExpenses(data);
            } catch (error) {
            console.error("Erro ao buscar saídas:", error);
        
            setError("Não foi possível carregar os saídas.");
            } finally {
            setLoading(false);
            }
    }

    const saveExpense = async (
        expense: Omit<ExpenseItem, "id">
        ) => {
        try {
            setError(null);

            const response = await createExpense(expense);
            
            setExpenses((prev) => [
            response.expense,
            ...prev,
            ]);
            
            return response.expense;

        } catch (error) {
            console.error("Erro ao salvar saída:", error);

            setError("Não foi possível salvar a saída.");

            throw error;
        }
        };

    const deleteExpenseId = async (id: number) => {
        try {

            setError(null);

            await deleteExpense(id)

            setExpenses((prev) =>
                prev.filter((item) => item.id !== id)
            );

        } catch (error) {
            setError("Não foi possivel deletar saída.")
            throw error;
        }
    };

    useEffect(() => {
        loadExpenses();
      }, []);

    return {
        expenses,
        loadExpenses,
        deleteExpenseId,
        saveExpense
    }
}