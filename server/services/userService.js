const db = require("../database/database");

function edit(id, data) {
  const {
    name,
    cpf,
    address,
    district,
    city,
    number,
    state,
    zip_code,
    credit_fee,
    bank_account1,
    bank_account2,
    bank_account3,
    bank_account4,
    bank_account5,
    pix_fee,
    debit_fee
  } = data;

  const query = `
    UPDATE users
    SET
      name = ?,
      cpf = ?,
      address = ?,
      district = ?,
      city = ?,
      number = ?,
      state = ?,
      zip_code = ?,
      credit_fee = ?,
      bank_account1 = ?,
      bank_account2 = ?,
      bank_account3 = ?,
      bank_account4 = ?,
      bank_account5 = ?,
      pix_fee = ?,
      debit_fee = ?
    WHERE id = ?
  `;

  const result = db.prepare(query).run(
    name,
    cpf,
    address,
    district,
    city,
    number,
    state,
    zip_code,
    credit_fee,
    bank_account1,
    bank_account2,
    bank_account3,
    bank_account4,
    bank_account5,
    pix_fee,
    debit_fee,
    id
  );

  if (result.changes === 0) {
    return null;
  }

  return getById(id);
}

function getById(id) {
  return db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(id);
}

function getAll() {
  return db
    .prepare("SELECT * FROM users LIMIT 1")
    .get();
}

module.exports = {
  getAll,
  getById,
  edit
};