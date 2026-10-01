import { useEffect, useState } from 'react';
import { EntryItem } from '../types/entryType';
import {getEntry, createEntry, deleteEntry, getEntryById, updateEntry} from "../services/entryService"

export function useEntries() {
    const [entries, setEntries] = useState<EntryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadEntry = async () => {
        try {
            setLoading(true);
            setError(null);
        
            const data = await getEntry();
        
            setEntries(data);
            } catch (error) {
            console.error("Erro ao buscar entradas:", error);
        
            setError("Não foi possível carregar os entradas.");
            } finally {
            setLoading(false);
            }
    }

    const saveEntries = async (
        entry: Omit<EntryItem, "id">
        ) => {
        try {
            setError(null);

            const response = await createEntry(entry);

            setEntries((prev) => [
            response.entry,
            ...prev,
            ]);

            return response.entry;

        } catch (error) {
            console.error("Erro ao salvar entrada:", error);

            setError("Não foi possível salvar a entrada.");

            throw error;
        }
        };

    const deleteEntryId = async (id: number) => {
        try {

            setError(null);

            await deleteEntry(id)

            setEntries((prev) =>
                prev.filter((item) => item.id !== id)
            );

        } catch (error) {
            setError("Não foi possivel deletar entrada.")
            throw error;
        }
    };


    useEffect(() => {
        loadEntry();
      }, []);
    

    return {
        entries,
        loadEntry,
        deleteEntryId,
        saveEntries
    };
    }