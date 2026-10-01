const db = require("../database/database");

function create(data) {
    const {
        date,
        amount,
        supplier,
        category,
        outgoing_account,
        observations,
        installment
    }  = data;

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
        amount,
        supplier,
        category,
        outgoing_account,
        observations,
        installment
    );
    return db
        .prepare("SELECT * FROM expenses WHERE id = ?")
        .get(result.lastInsertRowid);
}

function getAll() {
  return db
    .prepare("SELECT * FROM expenses ORDER BY id DESC")
    .all();
}

function getById(id) {
  return db
    .prepare("SELECT * FROM expenses WHERE id = ?")
    .get(id);
}

function update(id, data) {
  const { 
        date,
        amount,
        supplier,
        category,
        outgoing_account,
        observations,
        installment
    }  = data;

  const query = `
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
  `;

    const result = db.prepare(query).run(
        date,
        amount,
        supplier,
        category,
        outgoing_account,
        observations,
        installment,
        id
    );

  if (result.changes === 0) {
    return null;
  }

  return getById(id);
}

function remove(id) {
  const result = db
    .prepare("DELETE FROM expenses WHERE id = ?")
    .run(id);

  return result.changes > 0;
}

module.exports = {
  create,
  getAll,
  getById,
  update, 
  remove
};

