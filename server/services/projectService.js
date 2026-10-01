const db = require("../database/database");

// Converte o valor de grid para boolean ao retornar ao frontend
function formatProject(project) {
  if (!project) return null;

  return {
    ...project,
    grid: Boolean(project.grid),
    door: Boolean(project.door)
  };
}

function create(data) {
  const {
    id,
    name,
    client_id,
    type,
    model,
    width,
    height,
    glass_thickness,
    glass_color,
    profile_color,
    handle,
    updated_at,
    status,
    estimated_value,
    notes,
    grid,
    door,
  } = data;

  const query = `
    INSERT INTO project (
      id,
      name,
      client_id,
      type,
      model,
      width,
      height,
      glass_thickness,
      glass_color,
      profile_color,
      handle,
      updated_at,
      status,
      estimated_value,
      notes,
      grid,
      door
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const result = db.prepare(query).run(
    id,
    name,
    client_id && client_id !== 0 ? client_id : null,
    type,
    model,
    width,
    height,
    glass_thickness ?? null,
    glass_color,
    profile_color,
    handle,
    updated_at,
    status,
    estimated_value ?? null,
    notes ?? null,
    grid ? 1 : 0,
    door? 1 : 0
  );

  return formatProject(
    db.prepare("SELECT * FROM project WHERE id = ?").get(id)
  );
}

function getAll() {
  const projects = db
    .prepare("SELECT * FROM project ORDER BY id DESC")
    .all();

  return projects.map(formatProject);
}

function getById(id) {
  const project = db
    .prepare("SELECT * FROM project WHERE id = ?")
    .get(id);

  return formatProject(project);
}

function update(id, data) {
  const {
    name,
    client_id,
    type,
    model,
    width,
    height,
    glass_thickness,
    glass_color,
    profile_color,
    handle,
    updated_at,
    status,
    estimated_value,
    notes,
    grid,
  } = data;

  const query = `
    UPDATE project
    SET
      name = ?,
      client_id = ?,
      type = ?,
      model = ?,
      width = ?,
      height = ?,
      glass_thickness = ?,
      glass_color = ?,
      profile_color = ?,
      handle = ?,
      updated_at = ?,
      status = ?,
      estimated_value = ?,
      notes = ?,
      grid = ?,
      door = ?
    WHERE id = ?
  `;

  const result = db.prepare(query).run(
    name,
    client_id && client_id !== 0 ? client_id : null,
    type,
    model,
    width,
    height,
    glass_thickness ?? null,
    glass_color,
    profile_color,
    handle,
    updated_at,
    status,
    estimated_value ?? null,
    notes ?? null,
    grid ? 1 : 0,
    door? 1 : 0,
    id
  );

  if (result.changes === 0) {
    return null;
  }

  return getById(id);
}

function remove(id) {
  const result = db
    .prepare("DELETE FROM project WHERE id = ?")
    .run(id);

  return result.changes > 0;
}

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};