PRAGMA foreign_keys = ON;

-- =====================================================
-- CLIENTES
-- =====================================================
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

-- =====================================================
-- USUÁRIOS / CONFIGURAÇÕES DA EMPRESA
-- =====================================================

CREATE TABLE IF NOT EXISTS bank (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    bank TEXT NOT NULL,
    tipo TEXT NOT NULL,
    saldo REAL NOT NULL DEFAULT 0,
    agencia TEXT NOT NULL DEFAULT '',
    conta TEXT NOT NULL DEFAULT '',
    isPositive INTEGER NOT NULL DEFAULT 1,
    color TEXT NOT NULL DEFAULT '#64748b'
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL DEFAULT '',
    cpf TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    razao TEXT NOT NULL DEFAULT '',
    unidade_padrao TEXT NOT NULL DEFAULT '',
    garantia_padrao TEXT NOT NULL DEFAULT '',
    especialidade TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    district TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    number TEXT NOT NULL DEFAULT '',
    state TEXT NOT NULL DEFAULT '',
    zip_code TEXT NOT NULL DEFAULT '',

    credit_fee REAL NOT NULL DEFAULT 0,
    pix_fee REAL NOT NULL DEFAULT 0,
    debit_fee REAL NOT NULL DEFAULT 0,
    cash_balance_initial REAL NOT NULL DEFAULT 0
);


-- =====================================================
-- ENTRADAS
-- Inclui installment e receivable_id, utilizados no recebimento
-- de contas a receber.
-- =====================================================
CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount >= 0),
    description TEXT,
    category TEXT,
    client_id INTEGER,
    receipt TEXT,
    destination_account TEXT,
    installment TEXT DEFAULT '1/1',
    status TEXT,
    fee REAL NOT NULL DEFAULT 0,
    receivable_id INTEGER,
    FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (receivable_id)
        REFERENCES accounts_receivable(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- =====================================================
-- SAÍDAS / DESPESAS
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount >= 0),
    supplier TEXT,
    category TEXT,
    outgoing_account TEXT,
    observations TEXT,
    status TEXT
);

-- =====================================================
-- CONTAS A RECEBER
-- Campos alinhados ao ReceivableItem e receivableService atuais.
-- =====================================================
CREATE TABLE IF NOT EXISTS accounts_receivable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    document_id TEXT NOT NULL,
    entry_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    original_amount REAL NOT NULL CHECK (original_amount > 0),
    received_amount REAL NOT NULL DEFAULT 0 CHECK (received_amount >= 0),
    balance REAL NOT NULL CHECK (balance >= 0),
    installment TEXT NOT NULL DEFAULT '1',
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('received', 'pending', 'late', 'partial', 'paid')),
    FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- =====================================================
-- CONTAS A PAGAR
-- =====================================================
CREATE TABLE IF NOT EXISTS accounts_payable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount >= 0),
    supplier TEXT,
    observation TEXT,
    category TEXT,
    outgoing_account TEXT,
    status TEXT
);

-- =====================================================
-- PROJETOS 2D
-- =====================================================
CREATE TABLE IF NOT EXISTS project (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    client_id INTEGER,
    type TEXT NOT NULL,
    model TEXT NOT NULL,
    width REAL NOT NULL,
    height REAL NOT NULL,
    glass_thickness TEXT,
    glass_color TEXT NOT NULL,
    profile_color TEXT NOT NULL,
    handle TEXT,
    updated_at TEXT,
    status TEXT,
    estimated_value REAL,
    notes TEXT,
    grid INTEGER NOT NULL DEFAULT 0,
    door INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- =====================================================
-- ÍNDICES PARA CONSULTAS MAIS FREQUENTES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
CREATE INDEX IF NOT EXISTS idx_entries_client_id ON entries(client_id);
CREATE INDEX IF NOT EXISTS idx_entries_receivable_id ON entries(receivable_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_client_id ON accounts_receivable(client_id);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_due_date ON accounts_receivable(due_date);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_status ON accounts_receivable(status);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_date ON accounts_payable(date);
CREATE INDEX IF NOT EXISTS idx_project_client_id ON project(client_id);
