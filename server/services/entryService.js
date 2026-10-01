const db = require("../database/database");

function create(data) {
    const {
        date,
        description,
        amount,
        category,
        client_id,
        destination_account,
        fee,
        receipt,
        installment
    }  = data;

  const query = `
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
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const result = db.prepare(query).run(
        date,
        description,
        amount,
        category,
        client_id,
        destination_account,
        fee,
        receipt,
        installment
    );
    return db
        .prepare("SELECT * FROM entries WHERE id = ?")
        .get(result.lastInsertRowid);
}

function getAll() {
  return db
    .prepare("SELECT * FROM entries ORDER BY id DESC")
    .all();
}

function getById(id) {
  return db
    .prepare("SELECT * FROM entries WHERE id = ?")
    .get(id);
}

function update(id, data) {
  const {
        date,
        description,
        amount,
        category,
        client_id,
        destination_account,
        fee,
        receipt,
        installment
    }  = data;

  const query = `
    UPDATE entries 
    SET 
        date = ?,
        description = ?,
        amount = ?,
        category = ?,
        client_id = ?,
        destination_account = ?,
        fee = ?,
        receipt = ?,
        installment = ?
     WHERE id = ?
  `;

    const result = db.prepare(query).run(
        date,
        description,
        amount,
        category,
        client_id,
        destination_account,
        fee,
        receipt,
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
    .prepare("DELETE FROM entries WHERE id = ?")
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

