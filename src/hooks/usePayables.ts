import { useEffect, useState } from "react"; 
import {PayableItem} from '../types/payablesType'
import { createPayable, getPayable, deletePayable, updatePayableStatus } from "../services/payableService";


export function usePayable(){
    const [payable, setPayable] = useState<PayableItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPayable = async () => {
        try {
            setLoading(true);
            setError(null);
        
            const data = await getPayable();
        
            setPayable(data);
            } catch (error) {
            console.error("Erro ao buscar saídas:", error);
        
            setError("Não foi possível carregar os saídas.");
            } finally {
            setLoading(false);
            }
    }

    const savePayable = async (
        payable: Omit<PayableItem, "id">
        ) => {
        try {
            setError(null);

            const response = await createPayable(payable);

            setPayable((prev) => [
            ...response.payable,
            ...prev,
            ]);
            
            return response.payable;

        } catch (error) {
            console.error("Erro ao salvar saída:", error);

            setError("Não foi possível salvar a saída.");

            throw error;
        }
        };

    const deletePayableId = async (id: number) => {
        try {

            setError(null);

            await deletePayable(id)

            setPayable((prev) =>
                prev.filter((item) => item.id !== id)
            );

        } catch (error) {
            setError("Não foi possivel deletar saída.")
            throw error;
        }
    };

    const updateStatus = async (
        id: number,
        status: string
        ) => {
        try {
            const response = await updatePayableStatus(id, status);

            setPayable((prev) =>
            prev.map((item) =>
                item.id === id
                ? response.payable
                : item
            )
            );

            return response;
        } catch (error) {
            console.error("Erro ao atualizar status da conta:", error);
            throw error;
        }
        };

    useEffect(() => {
        loadPayable();
      }, []);

    return {
        payable,
        savePayable,
        deletePayableId,
        loadPayable,
        updateStatus
    }
}