const db = require("../database/database");

// ======================================
// IDENTIFICAR CAIXA INTERNO
// ======================================

function isCashAccount(account) {
  return String(account || "")
    .trim()
    .toLowerCase() === "caixa interno";
}

// ======================================
// ATUALIZAR SALDO BANCÁRIO
// ======================================

function updateBankBalance(outgoing_account, amount) {
  const account = db
    .prepare("SELECT id FROM bank WHERE bank = ?")
    .get(outgoing_account);

  if (!account) {
    throw new Error(
      `Conta bancária "${outgoing_account}" não encontrada. ` +
      "Verifique se o nome corresponde ao cadastrado."
    );
  }

  db.prepare(`
    UPDATE bank
    SET saldo = saldo + ?
    WHERE id = ?
  `).run(amount, account.id);
}

// ======================================
// ATUALIZAR CAIXA INTERNO
// ======================================

function updateCashBalance(amount) {
  const user = db
    .prepare("SELECT id FROM users ORDER BY id LIMIT 1")
    .get();

  if (!user) {
    throw new Error(
      "Nenhum usuário cadastrado para atualizar o Caixa Interno."
    );
  }

  db.prepare(`
    UPDATE users
    SET cash_balance_initial = cash_balance_initial + ?
    WHERE id = ?
  `).run(amount, user.id);
}

// ======================================
// ATUALIZAR SALDO CONFORME A CONTA
// ======================================

function updateAccountBalance(account, amount) {
  if (isCashAccount(account)) {
    updateCashBalance(amount);
  } else {
    updateBankBalance(account, amount);
  }
}

// ======================================
// CRIAR DESPESA
// ======================================

function create(data) {
  const {
    date,
    amount,
    supplier,
    category,
    outgoing_account,
    observations,
    installment,
  } = data;

  const transaction = db.transaction(() => {
    const expenseAmount = Number(amount);

    if (!Number.isFinite(expenseAmount) || expenseAmount <= 0) {
      throw new Error("O valor da despesa deve ser maior que zero.");
    }

    if (!outgoing_account) {
      throw new Error("Informe a conta de saída da despesa.");
    }

    const query = `
      INSERT INTO expenses (
        date,
        amount,
        supplier,
        category,
        outgoing_account,
        observations,
        installment
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = db.prepare(query).run(
      date,
      expenseAmount,
      supplier,
      category,
      outgoing_account,
      observations,
      installment
    );

    // Desconta o valor da conta utilizada.
    updateAccountBalance(
      outgoing_account,
      -expenseAmount
    );

    return db
      .prepare("SELECT * FROM expenses WHERE id = ?")
      .get(result.lastInsertRowid);
  });

  return transaction();
}

// ======================================
// LISTAR DESPESAS
// ======================================

function getAll() {
  return db
    .prepare("SELECT * FROM expenses ORDER BY id DESC")
    .all();
}

// ======================================
// BUSCAR DESPESA POR ID
// ======================================

function getById(id) {
  return db
    .prepare("SELECT * FROM expenses WHERE id = ?")
    .get(id);
}

// ======================================
// EDITAR DESPESA
// ======================================

function update(id, data) {
  const {
    date,
    amount,
    supplier,
    category,
    outgoing_account,
    observations,
    installment,
  } = data;

  const transaction = db.transaction(() => {
    const oldExpense = getById(id);

    if (!oldExpense) {
      return null;
    }

    const newAmount = Number(amount);

    if (!Number.isFinite(newAmount) || newAmount <= 0) {
      throw new Error("O valor da despesa deve ser maior que zero.");
    }

    if (!outgoing_account) {
      throw new Error("Informe a conta de saída da despesa.");
    }

    // Estorna o valor da conta utilizada anteriormente.
    updateAccountBalance(
      oldExpense.outgoing_account,
      Number(oldExpense.amount)
    );

    // Atualiza os dados da despesa.
    db.prepare(`
      UPDATE expenses
      SET
        date = ?,
        amount = ?,
        supplier = ?,
        category = ?,
        outgoing_account = ?,
        observations = ?,
        installment = ?
      WHERE id = ?
    `).run(
      date,
      newAmount,
      supplier,
      category,
      outgoing_account,
      observations,
      installment,
      id
    );

    // Desconta o novo valor da conta atual.
    updateAccountBalance(
      outgoing_account,
      -newAmount
    );

    return getById(id);
  });

  return transaction();
}

// ======================================
// EXCLUIR DESPESA
// ======================================

function remove(id) {
  const transaction = db.transaction(() => {
    const expense = getById(id);

    if (!expense) {
      return false;
    }

    // Devolve à conta o valor descontado anteriormente.
    updateAccountBalance(
      expense.outgoing_account,
      Number(expense.amount)
    );

    const result = db
      .prepare("DELETE FROM expenses WHERE id = ?")
      .run(id);

    return result.changes > 0;
  });

  return transaction();
}

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};