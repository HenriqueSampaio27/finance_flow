const db = require("../database/database");

function create(data) {
  const {
    name,
    cpf,
    phone,
    address,
    district,
    number,
    city,
    state,
    zip_code,
    email,
    state_registration,
    observation,
    complement
  } = data;

  const query = `
    INSERT INTO clients (
      name,
      cpf,
      phone,
      address,
      district,
      number,
      city,
      state,
      zip_code,
      email,
      state_registration,
      observation,
      complement
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const result = db.prepare(query).run(
    name,
    cpf,
    phone,
    address,
    district,
    number,
    city,
    state,
    zip_code,
    email,
    state_registration,
    observation,
    complement
  );

  return db
    .prepare("SELECT * FROM clients WHERE id = ?")
    .get(result.lastInsertRowid);
}

function getAll() {
  return db
    .prepare("SELECT * FROM clients ORDER BY id DESC")
    .all();
}

function getById(id) {
  return db
    .prepare("SELECT * FROM clients WHERE id = ?")
    .get(id);
}

function update(id, data) {
  const {
    name,
    cpf,
    phone,
    address,
    district,
    number,
    city,
    state,
    zip_code,
    email,
    state_registration,
    observation,
    complement
  } = data;

  const query = `
    UPDATE clients
    SET
      name = ?,
      cpf = ?,
      phone = ?,
      address = ?,
      district = ?,
      number = ?,
      city = ?,
      state = ?,
      zip_code = ?,
      email = ?,
      state_registration = ?,
      observation = ?,
      complement = ?
    WHERE id = ?
  `;

  const result = db.prepare(query).run(
    name,
    cpf,
    phone,
    address,
    district,
    number,
    city,
    state,
    zip_code,
    email,
    state_registration,
    observation,
    complement,
    id
  );

  if (result.changes === 0) {
    return null;
  }

  return getById(id);
}

function remove(id) {
  const result = db
    .prepare("DELETE FROM clients WHERE id = ?")
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