
const db = require("../database/database");

function edit(id, data) {
  const {
    name,
    cpf,
    email,
    phone,
    razao,
    unidade_padrao,
    garantia_padrao,
    especialidade,
    address,
    district,
    city,
    number,
    state,
    zip_code,
    credit_fee,
    pix_fee,
    debit_fee,
    cash_balance_initial,
  } = data;

  const query = `
    UPDATE users
    SET
      name = ?,
      cpf = ?,
      email = ?,
      phone = ?,
      razao = ?,
      unidade_padrao = ?,
      garantia_padrao = ?,
      especialidade = ?,
      address = ?,
      district = ?,
      city = ?,
      number = ?,
      state = ?,
      zip_code = ?,
      credit_fee = ?,
      pix_fee = ?,
      debit_fee = ?,
      cash_balance_initial = ?
    WHERE id = ?
  `;

  const result = db.prepare(query).run(
    name ?? "",
    cpf ?? "",
    email ?? "",
    phone ?? "",
    razao ?? "",
    unidade_padrao ?? "",
    garantia_padrao ?? "",
    especialidade ?? "",
    address ?? "",
    district ?? "",
    city ?? "",
    number ?? "",
    state ?? "",
    zip_code ?? "",
    credit_fee ?? 0,
    pix_fee ?? 0,
    debit_fee ?? 0,
    cash_balance_initial ?? 0,
    id
  );

  if (result.changes === 0) {
    return null;
  }

  return getById(id);
}

function getById(id) {
  return db.prepare(`
    SELECT *
    FROM users
    WHERE id = ?
  `).get(id);
}

// Mantém a consulta de um único usuário, como no código anterior.
function getAll() {
  return db.prepare(`
    SELECT *
    FROM users
    LIMIT 1
  `).get();
}

module.exports = {
  getAll,
  getById,
  edit,
};
