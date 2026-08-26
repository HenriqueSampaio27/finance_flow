PRAGMA foreign_keys = ON;

-- ==========================================
-- CLIENTES
-- ==========================================

CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cpf TEXT,
    phone TEXT,
    address TEXT,
    district TEXT,
    number TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    email TEXT,
    state_registration TEXT,
    observation TEXT,
    complement TEXT
);


-- ==========================================
-- USUÁRIOS
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cpf TEXT,
    address TEXT,
    district TEXT,
    city TEXT,
    number TEXT,
    state TEXT,
    zip_code TEXT,
    credit_fee REAL DEFAULT 0,
    bank_account1 TEXT,
    bank_account2 TEXT,
    bank_account3 TEXT,
    bank_account4 TEXT,
    bank_account5 TEXT,
    pix_fee REAL DEFAULT 0,
    debit_fee REAL DEFAULT 0
);


-- ==========================================
-- ENTRADAS
-- ==========================================

CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    category TEXT,
    client_id INTEGER,
    receipt TEXT,
    destination_account TEXT,
    status TEXT,
    fee REAL DEFAULT 0,

    FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);


-- ==========================================
-- SAÍDAS
-- ==========================================

CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    supplier TEXT,
    category TEXT,
    outgoing_account TEXT,
    observations TEXT,
    status TEXT
);


-- ==========================================
-- CONTAS A RECEBER
-- ==========================================

CREATE TABLE IF NOT EXISTS accounts_receivable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    original_amount REAL NOT NULL,
    description TEXT,
    category TEXT,
    client_id INTEGER,
    receipt TEXT,
    destination_account TEXT,
    fee REAL DEFAULT 0,
    status TEXT,
    due_date TEXT,
    installments INTEGER DEFAULT 1,
    received_amount REAL DEFAULT 0,

    FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);


-- ==========================================
-- CONTAS A PAGAR
-- ==========================================

CREATE TABLE IF NOT EXISTS accounts_payable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    supplier TEXT,
    observation TEXT,
    category TEXT,
    outgoing_account TEXT,
    status TEXT
);