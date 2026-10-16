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
// CRIAR CONTAS A PAGAR
// ======================================

function create(data) {
  const {
    date,
    amount,
    supplier,
    observation,
    category,
    outgoing_account,
    status,
    installment_total,
    installment_interval,
  } = data;

  const transaction = db.transaction(() => {
    const totalAmount = Number(amount);
    const totalInstallments = Number(installment_total) || 1;
    const interval = Number(installment_interval) || 30;

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      throw new Error("O valor da conta deve ser maior que zero.");
    }

    if (
      !Number.isInteger(totalInstallments) ||
      totalInstallments < 1
    ) {
      throw new Error("A quantidade de parcelas deve ser válida.");
    }

    if (!Number.isFinite(interval) || interval < 1) {
      throw new Error("O intervalo entre parcelas deve ser válido.");
    }

    // Divide o valor em centavos para evitar diferenças de arredondamento.
    const totalCents = Math.round(totalAmount * 100);
    const baseCents = Math.floor(totalCents / totalInstallments);
    const remainderCents = totalCents % totalInstallments;

    const payables = [];

    for (let i = 1; i <= totalInstallments; i++) {
      const installmentCents =
        baseCents + (i <= remainderCents ? 1 : 0);

      const installmentAmount = installmentCents / 100;

      const installmentDate = new Date(`${date}T12:00:00`);

      if (Number.isNaN(installmentDate.getTime())) {
        throw new Error("A data informada é inválida.");
      }

      installmentDate.setDate(
        installmentDate.getDate() + interval * (i - 1)
      );

      const formattedDate = installmentDate
        .toISOString()
        .split("T")[0];

      const result = db.prepare(`
        INSERT INTO accounts_payable (
          date,
          amount,
          supplier,
          observation,
          category,
          outgoing_account,
          status,
          installment_number,
          installment_total
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        formattedDate,
        installmentAmount,
        supplier,
        observation,
        category,
        outgoing_account,
        status,
        i,
        totalInstallments
      );

      const payable = db.prepare(`
        SELECT *
        FROM accounts_payable
        WHERE id = ?
      `).get(result.lastInsertRowid);

      payables.push(payable);
    }

    return payables;
  });

  return transaction();
}

// ======================================
// LISTAR CONTAS A PAGAR
// ======================================

function getAll() {
  return db
    .prepare("SELECT * FROM accounts_payable ORDER BY id DESC")
    .all();
}

// ======================================
// BUSCAR CONTA POR ID
// ======================================

function getById(id) {
  return db
    .prepare("SELECT * FROM accounts_payable WHERE id = ?")
    .get(id);
}

// ======================================
// REGISTRAR PAGAMENTO
// ======================================

function registerPayment(id, receipt, account) {
  const transaction = db.transaction(() => {

    // 1. BUSCAR CONTA A PAGAR
    const payable = getById(id);

    if (!payable) {
      throw new Error("Conta a pagar não encontrada.");
    }

    // 2. VALIDAR STATUS
    if (
      String(payable.status || "").trim().toLowerCase() === "pago"
    ) {
      throw new Error("Esta conta já foi paga.");
    }

    // 3. VALIDAR VALOR
    const amount = Number(payable.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("O valor da conta deve ser maior que zero.");
    }

    if (!account) {
      throw new Error("Informe a conta utilizada para o pagamento.");
    }

    // 4. ATUALIZAR STATUS
    const result = db.prepare(`
      UPDATE accounts_payable
      SET status = ?
      WHERE id = ?
        AND LOWER(status) != LOWER(?)
    `).run("Pago", id, "Pago");

    if (result.changes !== 1) {
      throw new Error(
        "Não foi possível atualizar o status da conta."
      );
    }

    // 5. FORMATAR PARCELA
    const installment =
      `${payable.installment_number}/${payable.installment_total}`;

    // 6. REGISTRAR SAÍDA
    db.prepare(`
      INSERT INTO expenses (
        date,
        amount,
        supplier,
        category,
        outgoing_account,
        observations,
        installment,
        id_account_payment
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      new Date().toISOString().split("T")[0],
      amount,
      payable.supplier,
      payable.category,
      account,
      `Pagamento da conta #${id}, pelo ${receipt}`,
      installment,
      id
    );

    // 7. DESCONTAR DO SALDO CORRETO
    // Caixa Interno -> users.cash_balance_initial
    // Conta bancária -> bank.saldo
    updateAccountBalance(account, -amount);

    // 8. RETORNAR CONTA ATUALIZADA
    return getById(id);
  });

  return transaction();
}

// ======================================
// EXCLUIR CONTA A PAGAR
// ======================================

function remove(id) {
  const transaction = db.transaction(() => {
    const payable = getById(id);

    if (!payable) {
      return false;
    }

    // Não permite excluir uma conta já paga sem antes
    // estornar a despesa e o saldo correspondente.
    if (
      String(payable.status || "").trim().toLowerCase() === "pago"
    ) {
      throw new Error(
        "Esta conta já foi paga. Estorne o pagamento antes de excluí-la."
      );
    }

    const result = db
      .prepare("DELETE FROM accounts_payable WHERE id = ?")
      .run(id);

    return result.changes > 0;
  });

  return transaction();
}

module.exports = {
  create,
  getAll,
  getById,
  registerPayment,
  remove,
};