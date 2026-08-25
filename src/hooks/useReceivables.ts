import { useState } from "react";
import {ReceivableItem, StatusRecebimento} from "../types/financial"
import {initialReceivables} from "../data/initialData"

export function useReceivables(){
    const [receivables, setReceivables] = useState<ReceivableItem[]>(initialReceivables);

      const deleteReceivable = (id: string) => {
        setReceivables(prev => prev.filter(r => r.id !== id));
      };
    
      const updateReceivableStatus = (id: string, newStatus: StatusRecebimento) => {
        setReceivables(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, saldo: newStatus === 'Recebido' ? 0 : r.valorOriginal } : r));
      };

      return{
        receivables,
        deleteReceivable,
        updateReceivableStatus
      }
} 