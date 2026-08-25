import { useState } from 'react';
import { EntryItem, StatusRecebimento } from '../types';
import { initialEntries } from '../data/initialData';

export function useEntries() {
  const [entries, setEntries] = useState<EntryItem[]>(initialEntries);

  const addEntry = (newEntry: EntryItem) => {
    setEntries(prev => [newEntry, ...prev]);
  };

  const deleteEntry = (id: string) => {
    setEntries(prev =>
      prev.filter(entry => entry.id !== id)
    );
  };

  const updateEntryStatus = (
    id: string,
    newStatus: StatusRecebimento
  ) => {
    setEntries(prev =>
      prev.map(entry =>
        entry.id === id
          ? { ...entry, status: newStatus }
          : entry
      )
    );
  };

  return {
    entries,
    addEntry,
    deleteEntry,
    updateEntryStatus,
  };
}