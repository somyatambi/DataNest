import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../growthcast.db');

const SQL = await initSqlJs();

let sqlDb;
if (existsSync(DB_PATH)) {
  sqlDb = new SQL.Database(readFileSync(DB_PATH));
} else {
  sqlDb = new SQL.Database();
}

function save() {
  writeFileSync(DB_PATH, Buffer.from(sqlDb.export()));
}

sqlDb.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, company TEXT DEFAULT '', role TEXT DEFAULT 'employee', files_processed INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))");
sqlDb.run("CREATE TABLE IF NOT EXISTS file_history (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, user_name TEXT NOT NULL, filename TEXT NOT NULL, original_rows INTEGER DEFAULT 0, cleaned_rows INTEGER DEFAULT 0, duplicates_removed INTEGER DEFAULT 0, missing_filled INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))");
save();
console.log('SQLite (sql.js) database ready:', DB_PATH);

function prepare(sql) {
  return {
    run(...args) {
      const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
      const stmt = sqlDb.prepare(sql);
      stmt.run(params.length > 0 ? params : undefined);
      stmt.free();
      const ro = sqlDb.exec('SELECT last_insert_rowid()');
      const lastId = ro.length > 0 ? ro[0].values[0][0] : null;
      save();
      return { lastInsertRowid: lastId, changes: sqlDb.getRowsModified() };
    },
    get(...args) {
      const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
      const stmt = sqlDb.prepare(sql);
      if (params.length > 0) stmt.bind(params);
      const result = stmt.step() ? stmt.getAsObject() : undefined;
      stmt.free();
      return result;
    },
    all(...args) {
      const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
      const stmt = sqlDb.prepare(sql);
      if (params.length > 0) stmt.bind(params);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      return rows;
    }
  };
}

function exec(sql) {
  sqlDb.run(sql);
  save();
}

export default { prepare, exec };
