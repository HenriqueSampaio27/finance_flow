export interface UserType {
    id?: number;
    name: string;
    cpf: string;
    address: string;
    district: string;
    city: string;
    number: string;
    state: string;
    zip_code: string;
    credit_fee: number;
    bank_account1?: string;
    bank_account2?: string;
    bank_account3?: string;
    bank_account4?: string;
    bank_account5?: string;
    pix_fee: number;
    debit_fee: number;
}