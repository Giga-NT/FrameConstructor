import Database from 'better-sqlite3';
import path from 'path';

// Создаем папку data в корне проекта
const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
const db = new Database(dbPath);

// Включаем foreign keys
db.pragma('foreign_keys = ON');

// Создаем таблицы
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    address TEXT,
    isVerified INTEGER DEFAULT 0,
    verificationCode TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    params TEXT NOT NULL, -- JSON строка
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    projectId TEXT NOT NULL,
    projectName TEXT NOT NULL,
    projectType TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    totalAmount REAL NOT NULL,
    customerData TEXT NOT NULL, -- JSON строка
    costCalculation TEXT NOT NULL, -- JSON строка
    projectParams TEXT NOT NULL, -- JSON строка
    isArchived INTEGER DEFAULT 0,
    orderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
`);

export default db;