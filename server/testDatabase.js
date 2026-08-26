const db = require("./database/database");

console.log("🔎 Testando banco...");

const tables = db
  .prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
    ORDER BY name
  `)
  .all();

console.log("📋 Tabelas encontradas:");

console.table(tables);

db.close();