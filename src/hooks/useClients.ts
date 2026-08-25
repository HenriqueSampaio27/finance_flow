import { useState } from "react";
import {ClientItem} from "../types/financial"
import {initialClients} from "../data/initialData"

export function useClients(){
    const [clients, setClients] = useState<ClientItem[]>(initialClients);

    
      const saveClient = (newClient: ClientItem) => {
        setClients(prev => {
          const exists = prev.some(c => c.id === newClient.id);
          if (exists) {
            return prev.map(c => c.id === newClient.id ? newClient : c);
          }
          return [newClient, ...prev];
        });
      };
    
    return{
        clients,
        saveClient
    }
}