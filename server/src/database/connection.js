const { Pool } = require('pg');
const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db = null;
let dbType = null;

async function setupDatabase() {
  dbType = process.env.DB_TYPE || 'postgresql';

  try {
    switch (dbType) {
      case 'postgresql':
        db = new Pool({
          host: process.env.DB_HOST,
          port: process.env.DB_PORT || 5432,
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
        });

        // Test connection
        const client = await db.connect();
        await client.query('SELECT NOW()');
        client.release();
        break;

      case 'mysql':
        db = await mysql.createPool({
          host: process.env.DB_HOST,
          port: process.env.DB_PORT || 3306,
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0
        });

        // Test connection
        await db.execute('SELECT 1');
        break;

      case 'sqlite':
        const dbPath = process.env.SQLITE_PATH || path.join(__dirname, '../../../data/database.sqlite');
        db = new sqlite3.Database(dbPath);
        break;

      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }

    console.log(`Connected to ${dbType} database`);
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

async function query(sql, params = []) {
  try {
    switch (dbType) {
      case 'postgresql':
        const pgResult = await db.query(sql, params);
        return pgResult.rows;

      case 'mysql':
        const [mysqlRows] = await db.execute(sql, params);
        return mysqlRows;

      case 'sqlite':
        return new Promise((resolve, reject) => {
          db.all(sql, params, (err, rows) => {
            if (err) reject(err);else
            resolve(rows);
          });
        });

      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

async function execute(sql, params = []) {
  try {
    switch (dbType) {
      case 'postgresql':
        const pgResult = await db.query(sql, params);
        return {
          affectedRows: pgResult.rowCount,
          insertId: pgResult.rows[0]?.id || null
        };

      case 'mysql':
        const [mysqlResult] = await db.execute(sql, params);
        return {
          affectedRows: mysqlResult.affectedRows,
          insertId: mysqlResult.insertId
        };

      case 'sqlite':
        return new Promise((resolve, reject) => {
          db.run(sql, params, function (err) {
            if (err) reject(err);else
            resolve({
              affectedRows: this.changes,
              insertId: this.lastID
            });
          });
        });

      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}

async function closeDatabase() {
  if (db) {
    switch (dbType) {
      case 'postgresql':
        await db.end();
        break;
      case 'mysql':
        await db.end();
        break;
      case 'sqlite':
        db.close();
        break;
    }
    db = null;
  }
}

module.exports = {
  setupDatabase,
  query,
  execute,
  closeDatabase,
  getDbType: () => dbType,
  getDb: () => db
};