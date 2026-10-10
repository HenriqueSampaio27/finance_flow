const db = require("../database/database");

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
    installment_interval
  } = data;

  const totalInstallments = Number(installment_total) || 1;
  const interval = Number(installment_interval) || 30;

  const installmentAmount = amount / totalInstallments;

  // Array que vai armazenar todas as parcelas criadas
  const payables = [];

  for (let i = 1; i <= totalInstallments; i++) {

    const installmentDate = new Date(date);

    installmentDate.setDate(
      installmentDate.getDate() + (interval * (i - 1))
    );

    const formattedDate = installmentDate
      .toISOString()
      .split("T")[0];

    const query = `
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
    `;

    const result = db.prepare(query).run(
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

    // Busca a parcela que acabou de ser criada
    const payable = db
      .prepare(`
        SELECT *
        FROM accounts_payable
        WHERE id = ?
      `)
      .get(result.lastInsertRowid);

    // Adiciona a parcela ao array
    payables.push(payable);
  }

  // Retorna todas as parcelas criadas
  return payables;
}


function getAll() {
  return db
    .prepare("SELECT * FROM accounts_payable ORDER BY id DESC")
    .all();
}

function getById(id) {
  return db
    .prepare("SELECT * FROM accounts_payable WHERE id = ?")
    .get(id);
}

function registerPayment(id, receipt, account) {
  const transaction = db.transaction(() => {

    // 1. BUSCAR CONTA A PAGAR
    const payable = db.prepare(`
      SELECT *
      FROM accounts_payable
      WHERE id = ?
    `).get(id);

    if (!payable) {
      throw new Error("Conta a pagar não encontrada.");
    }

    // 2. VALIDAR STATUS
    if (payable.status === "Pago") {
      throw new Error("Esta conta já foi paga.");
    }

    // 3. VALIDAR VALOR
    const amount = Number(payable.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("O valor da conta deve ser maior que zero.");
    }

    // 4. ATUALIZAR STATUS
    const result = db.prepare(`
      UPDATE accounts_payable
      SET status = ?
      WHERE id = ?
        AND status != ?
    `).run("Pago", id, "Pago");

    if (result.changes !== 1) {
      throw new Error("Não foi possível atualizar o status da conta.");
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

    // 7. RETORNAR CONTA ATUALIZADA
    return db.prepare(`
      SELECT *
      FROM accounts_payable
      WHERE id = ?
    `).get(id);

  });

  return transaction();
}

function remove(id) {
  const result = db
    .prepare("DELETE FROM accounts_payable WHERE id = ?")
    .run(id);

  return result.changes > 0;
}

module.exports = {
  create,
  getAll,
  getById,
  registerPayment, 
  remove
};

