import { useState } from "react"; 
import {ExpenseItem, StatusPagamento} from '../types/financial'
import {initialExpenses} from '../data/initialData'

export function useExpenses(){
    const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);

    const addExpense = (newExpense: ExpenseItem) => {
        setExpenses(prev => [newExpense, ...prev]);
    };

    const deleteExpense = (id: string) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    const updateExpenseStatus = (id: string, newStatus: StatusPagamento) => {
        setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
    };

    return {
        expenses,
        addExpense,
        deleteExpense,
        updateExpenseStatus
    }
}
 