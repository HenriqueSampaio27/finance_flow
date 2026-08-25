import { useState } from "react";
import {PayableItem, StatusPagamento} from "../types"
import {initialPayables} from "../data/initialData"

export function usePayables(){
    const [payables, setPayables] = useState<PayableItem[]>(initialPayables);

      const deletePayable = (id: string) => {
        setPayables(prev => prev.filter(p => p.id !== id));
      };
    
      const updatePayableStatus = (id: string, newStatus: StatusPagamento) => {
        setPayables(prev => prev.map(p => p.id === id ? { ...p, status: newStatus, saldo: newStatus === 'Pago' ? 0 : p.valorOriginal } : p));
      };
    
      return{
        payables,
        deletePayable,
        updatePayableStatus
      }
}