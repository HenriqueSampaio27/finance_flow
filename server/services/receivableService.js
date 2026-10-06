
const db = require("../database/database");

function create(data) {
  const {
    client_id,
    document_id,
    entry_date,
    due_date,
    original_amount,
    received_amount = 0,
    status = "pending",
    installment = "1",
  } = data;

  const totalInstallments = Number(installment);

  if (
    !Number.isInteger(totalInstallments) ||
    totalInstallments < 1
  ) {
    throw new Error("O número de parcelas deve ser um inteiro positivo.");
  }

  if (!Number.isFinite(Number(original_amount)) || Number(original_amount) <= 0) {
    throw new Error("O valor a receber deve ser maior que zero.");
  }

  // Converte para centavos para evitar erros de arredondamento
  const totalCents = Math.round(Number(original_amount) * 100);
  const baseCents = Math.floor(totalCents / totalInstallments);
  const remainder = totalCents % totalInstallments;

  const insert = db.prepare(`
    INSERT INTO accounts_receivable (
      client_id,
      document_id,
      entry_date,
      due_date,
      original_amount,
      received_amount,
      balance,
      installment,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const getById = db.prepare(`
    SELECT * FROM accounts_receivable WHERE id = ?
  `);

  // Todas as parcelas são inseridas juntas.
  // Se uma falhar, o SQLite desfaz todas.
  const transaction = db.transaction(() => {
    const created = [];

    for (let i = 0; i < totalInstallments; i++) {
        const installmentCents = baseCents + (i < remainder ? 1 : 0);
        const amount = installmentCents / 100;

        const installmentLabel =
            totalInstallments === 1
            ? "1"
            : `${i + 1}/${totalInstallments}`;

        // Soma 30 dias para cada parcela
        const installmentDueDate = new Date(`${due_date}T00:00:00`);
        installmentDueDate.setDate(
            installmentDueDate.getDate() + (i * 30)
        );

        // Formata para YYYY-MM-DD
        const formattedDueDate = installmentDueDate
            .toISOString()
            .split("T")[0];

        const result = insert.run(
            client_id,
            document_id,
            entry_date,
            formattedDueDate,
            amount,
            0,
            amount,
            installmentLabel,
            status
        );

        created.push(getById.get(result.lastInsertRowid));
        }
    
    return created;
  });
  
  return transaction();
}

function registerPayment(
  id,
  paymentAmount,
  receipt,
  destination_account,
  fee = 0
) {

  const transaction = db.transaction(() => {


    // ======================================
    // 1. BUSCAR CONTA A RECEBER
    // ======================================

    const receivable =
      db.prepare(`
        SELECT *
        FROM accounts_receivable
        WHERE id = ?
      `).get(id);


    if (!receivable) {
      throw new Error(
        "Conta a receber não encontrada."
      );
    }


    // ======================================
    // 2. VALIDAR VALOR
    // ======================================

    const amount =
      Number(paymentAmount);


    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new Error(
        "O valor pago deve ser maior que zero."
      );
    }


    const currentReceived =
      Number(
        receivable.received_amount || 0
      );


    const originalAmount =
      Number(
        receivable.original_amount || 0
      );


    // ======================================
    // 3. NOVO VALOR RECEBIDO
    // ======================================
    
    const newReceived = Number(
        (currentReceived + amount).toFixed(2)
    );

    if (
      newReceived > originalAmount
    ) {
      throw new Error(
        "O valor recebido não pode ser maior que o valor da conta."
      );
    }


    // ======================================
    // 4. NOVO SALDO
    // ======================================

    const newBalance = Math.max(
        Number((originalAmount - newReceived).toFixed(2)),
        0
    );


    // ======================================
    // 5. NOVO STATUS
    // ======================================

    const newStatus =
      newBalance <= 0
        ? "paid"
        : "partial";


    // ======================================
    // 6. ATUALIZA CONTA A RECEBER
    // ======================================

    db.prepare(`
      UPDATE accounts_receivable
      SET
        received_amount = ?,
        balance = ?,
        status = ?
      WHERE id = ?
    `).run(
      newReceived,
      newBalance,
      newStatus,
      id
    );


    // ======================================
    // 7. CRIAR ENTRADA
    // ======================================

    db.prepare(`
      INSERT INTO entries (
        date,
        amount,
        description,
        category,
        client_id,
        receipt,
        destination_account,
        installment,
        fee,
        receivable_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(

      new Date()
        .toISOString()
        .split("T")[0],

      amount,

      `Recebimento da conta #${id}`,

      "Recebimento",

      receivable.client_id,

      receipt,

      destination_account,

      receivable.installment,

      Number(fee) || 0,

      id
    );


    // ======================================
    // 8. RETORNAR CONTA ATUALIZADA
    // ======================================

    return db.prepare(`
      SELECT *
      FROM accounts_receivable
      WHERE id = ?
    `).get(id);

  });


  return transaction();
}

function getAll() {
  return db
    .prepare(`
      SELECT * FROM accounts_receivable
      ORDER BY id DESC
    `)
    .all();
}

function getById(id) {
  return db
    .prepare(`
      SELECT * FROM accounts_receivable
      WHERE id = ?
    `)
    .get(id);
}

function update(id, data) {
  const {
    client_id,
    document_id,
    entry_date,
    due_date,
    original_amount,
    received_amount,
    balance,
    installment,
    status,
  } = data;

  const query = `
    UPDATE accounts_receivable
    SET
      client_id = ?,
      document_id = ?,
      entry_date = ?,
      due_date = ?,
      original_amount = ?,
      received_amount = ?,
      balance = ?,
      installment = ?,
      status = ?
    WHERE id = ?
  `;

  const result = db.prepare(query).run(
    client_id,
    document_id,
    entry_date,
    due_date,
    original_amount,
    received_amount,
    balance,
    installment,
    status,
    id
  );

  if (result.changes === 0) {
    return null;
  }

  return getById(id);
}

function updateStatus(id, status) {
  const result = db
    .prepare(`
      UPDATE accounts_receivable
      SET status = ?
      WHERE id = ?
    `)
    .run(status, id);

  if (result.changes === 0) {
    return null;
  }

  return getById(id);
}

function remove(id) {
  const result = db
    .prepare(`
      DELETE FROM accounts_receivable
      WHERE id = ?
    `)
    .run(id);

  return result.changes > 0;
}

module.exports = {
  create,
  getAll,
  getById,
  update,
  updateStatus,
  remove,
  registerPayment
};