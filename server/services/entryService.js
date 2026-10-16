const db = require("../database/database");

// Calcula o valor líquido da entrada.
function getNetAmount(amount, fee) {
  return Number(amount || 0) - (((Number(fee) * Number(amount))/100 || 0));
}

// Verifica se o recebimento foi feito em espécie.
function isCashReceipt(receipt) {
  return String(receipt || "").trim().toLowerCase() === "espécie";
}

// Atualiza o Caixa Interno.
function updateCashBalance(amount) {
  const user = db
    .prepare("SELECT id FROM users ORDER BY id LIMIT 1")
    .get();

  if (!user) {
    throw new Error("Nenhum usuário cadastrado para atualizar o Caixa Interno.");
  }

  db.prepare(`
    UPDATE users
    SET cash_balance_initial = cash_balance_initial + ?
    WHERE id = ?
  `).run(amount, user.id);
}

// Atualiza o saldo de uma conta bancária.
// O argumento amount pode ser positivo ou negativo.
function updateBankBalance(destinationAccount, amount) {
  if (!destinationAccount) {
    throw new Error("A conta bancária de destino não foi informada.");
  }

  const account = db
    .prepare("SELECT id FROM bank WHERE bank = ? LIMIT 1")
    .get(destinationAccount);

  if (!account) {
    throw new Error(
      `A conta bancária "${destinationAccount}" não foi encontrada.`
    );
  }

  db.prepare(`
    UPDATE bank
    SET saldo = saldo + ?
    WHERE id = ?
  `).run(amount, account.id);
}

// Aplica ou estorna o saldo conforme o meio de recebimento.
function adjustBalance(entry, amount) {
  if (isCashReceipt(entry.receipt)) {
    updateCashBalance(amount);
  } else {
    updateBankBalance(entry.destination_account, amount);
  }
}

// Cria uma entrada e atualiza o saldo correspondente.
function create(entry) {
  const transaction = db.transaction(() => {
    const {
      date,
      description,
      amount,
      category,
      client_id,
      destination_account,
      fee = 0,
      receipt,
      installment,
    } = entry;

    const result = db.prepare(`
      INSERT INTO entries (
        date,
        description,
        amount,
        category,
        client_id,
        destination_account,
        fee,
        receipt,
        installment
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      date,
      description,
      amount,
      category,
      client_id ?? null,
      destination_account ?? "Caixa Interno",
      fee,
      receipt ?? "Espécie",
      installment ?? "1/1"
    );

    const newEntry = db
      .prepare("SELECT * FROM entries WHERE id = ?")
      .get(result.lastInsertRowid);

    adjustBalance(newEntry, getNetAmount(newEntry.amount, newEntry.fee));

    return newEntry;
  });

  return transaction();
}

// Lista todas as entradas.
function getAll() {
  return db.prepare("SELECT * FROM entries ORDER BY id DESC").all();
}

// Busca uma entrada pelo ID.
function getById(id) {
  return db.prepare("SELECT * FROM entries WHERE id = ?").get(id);
}

// Edita uma entrada, estornando o saldo antigo e aplicando o novo.
function update(id, entry) {
  const transaction = db.transaction(() => {
    const oldEntry = db
      .prepare("SELECT * FROM entries WHERE id = ?")
      .get(id);

    if (!oldEntry) {
      throw new Error("Entrada não encontrada.");
    }

    const updatedEntry = {
      ...oldEntry,
      ...entry,
      id: oldEntry.id,
      fee: entry.fee ?? oldEntry.fee ?? 0,
    };

    // Estorna a movimentação anterior.
    adjustBalance(
      oldEntry,
      -getNetAmount(oldEntry.amount, oldEntry.fee)
    );

    db.prepare(`
      UPDATE entries
      SET date = ?,
          description = ?,
          amount = ?,
          category = ?,
          client_id = ?,
          destination_account = ?,
          fee = ?,
          receipt = ?,
          installment = ?
      WHERE id = ?
    `).run(
      updatedEntry.date,
      updatedEntry.description,
      updatedEntry.amount,
      updatedEntry.category,
      updatedEntry.client_id ?? null,
      updatedEntry.destination_account ?? "Caixa Interno",
      updatedEntry.fee,
      updatedEntry.receipt ?? "Espécie",
      updatedEntry.installment ?? "1/1",
      id
    );

    const savedEntry = db
      .prepare("SELECT * FROM entries WHERE id = ?")
      .get(id);

    // Aplica a movimentação atualizada.
    adjustBalance(
      savedEntry,
      getNetAmount(savedEntry.amount, savedEntry.fee)
    );

    return savedEntry;
  });

  return transaction();
}

// Exclui a entrada e estorna o saldo correspondente.
function remove(id) {
  const transaction = db.transaction(() => {
    const entry = db
      .prepare("SELECT * FROM entries WHERE id = ?")
      .get(id);

    if (!entry) {
      throw new Error("Entrada não encontrada.");
    }

    adjustBalance(entry, -getNetAmount(entry.amount, entry.fee));

    db.prepare("DELETE FROM entries WHERE id = ?").run(id);

    return { message: "Entrada excluída com sucesso." };
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