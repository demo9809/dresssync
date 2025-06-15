const { query, execute, getDbType } = require('../database/connection');
const fs = require('fs').promises;
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, 'sql');

async function createMigrationsTable() {
  const dbType = getDbType();
  let sql = '';
  
  switch (dbType) {
    case 'postgresql':
      sql = `
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      break;
    case 'mysql':
      sql = `
        CREATE TABLE IF NOT EXISTS migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          filename VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      break;
    case 'sqlite':
      sql = `
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filename TEXT NOT NULL UNIQUE,
          executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;
      break;
  }
  
  await execute(sql);
}

async function getExecutedMigrations() {
  const results = await query('SELECT filename FROM migrations ORDER BY id');
  return results.map(row => row.filename);
}

async function markMigrationAsExecuted(filename) {
  await execute('INSERT INTO migrations (filename) VALUES (?)', [filename]);
}

async function runMigrations() {
  try {
    console.log('Creating migrations table...');
    await createMigrationsTable();
    
    console.log('Loading migration files...');
    const migrationFiles = await fs.readdir(MIGRATIONS_DIR);
    const sqlFiles = migrationFiles
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log('Getting executed migrations...');
    const executedMigrations = await getExecutedMigrations();
    
    console.log('Running pending migrations...');
    for (const file of sqlFiles) {
      if (!executedMigrations.includes(file)) {
        console.log(`Running migration: ${file}`);
        
        const filePath = path.join(MIGRATIONS_DIR, file);
        const sql = await fs.readFile(filePath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = sql.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
          if (statement.trim()) {
            await execute(statement);
          }
        }
        
        await markMigrationAsExecuted(file);
        console.log(`Migration completed: ${file}`);
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

module.exports = { runMigrations };