const db = require("../database/database");

function getAll() {
  return db.prepare(`
    SELECT * FROM bank
    ORDER BY id ASC
  `).all();
}

function getById(id) {
  return db.prepare(`
    SELECT * FROM bank
    WHERE id = ?
  `).get(id);
}

function create(data) {
  const {
    name,
    bank,
    tipo,
    saldo,
    agencia,
    conta,
    isPositive,
    color
  } = data;

  const result = db.prepare(`
    INSERT INTO bank (
      name,
      bank,
      tipo,
      saldo,
      agencia,
      conta,
      isPositive,
      color
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name,
    bank,
    tipo,
    Number(saldo ?? 0),
    agencia ?? "",
    conta ?? "",
    isPositive === false ? 0 : 1,
    color ?? "#64748b"
  );

  return getById(Number(result.lastInsertRowid));
}

function update(id, data) {
  const {
    name,
    bank,
    tipo,
    saldo,
    agencia,
    conta,
    isPositive,
    color
  } = data;

  const result = db.prepare(`
    UPDATE bank
    SET
      name = ?,
      bank = ?,
      tipo = ?,
      saldo = ?,
      agencia = ?,
      conta = ?,
      isPositive = ?,
      color = ?
    WHERE id = ?
  `).run(
    name,
    bank,
    tipo,
    Number(saldo ?? 0),
    agencia ?? "",
    conta ?? "",
    isPositive === false ? 0 : 1,
    color ?? "#64748b",
    id
  );

  if (result.changes === 0) {
    return null;
  }

  return getById(id);
}

function remove(id) {
  const result = db.prepare(`
    DELETE FROM bank
    WHERE id = ?
  `).run(id);

  return result.changes > 0;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};