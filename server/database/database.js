const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

// Caminho do banco de dados
const dbPath = path.join(__dirname, "finance.db");

// Cria ou abre o banco
const db = new Database(dbPath);

// Ativa o uso de chaves estrangeiras
db.pragma("foreign_keys = ON");

// Caminho do schema
const schemaPath = path.join(__dirname, "schema.sql");



// Lê o schema
const schema = fs.readFileSync(schemaPath, "utf-8");

// Executa o schema
db.exec(schema);

console.log("✅ Banco SQLite conectado com sucesso!");
console.log(`📁 Banco: ${dbPath}`);

module.exports = db;