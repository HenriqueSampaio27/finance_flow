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

function updateStatus(id, status) {

  const payable = getById(id);

  if (!payable) {
    return null;
  }

  const result = db.prepare(`
    UPDATE accounts_payable
    SET status = ?
    WHERE id = ?
  `).run(status, id);

  if (result.changes === 0) {
    return null;
  }

  // Só cria a saída quando a conta
  // realmente muda para Pago
  if (status === "Pago" && payable.status !== "Pago") {

    const installment = `${payable.installment_number}/${payable.installment_total}`;

    db.prepare(`
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
    `).run(
      payable.date,
      payable.amount,
      payable.supplier,
      payable.category,
      payable.outgoing_account,
      payable.observation,
      installment
    );
  }

  return getById(id);
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
  updateStatus, 
  remove
};

