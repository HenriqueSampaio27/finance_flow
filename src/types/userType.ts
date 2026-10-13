export interface UserType {
    id?: number;
    name: string;
    cpf: string;
    email: string;
    phone: string;
    razao: string;
    unidade_padrao: string;
    garantia_padrao: string;
    especialidade: string;
    address: string;
    district: string;
    city: string;
    number: string;
    state: string;
    zip_code: string;
    credit_fee: number;
    cash_balance_initial: number,
    pix_fee: number;
    debit_fee: number;
}

export interface Bank_account {
    id: number;
    name: string;
    bank: string
    tipo: string;
    saldo: number;
    agencia: string;
    conta: string;
    isPositive: boolean;
    color: string;
}