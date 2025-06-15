const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');
const { query, execute, setupDatabase } = require('../database/connection');
const { runMigrations } = require('../migrations/migrate');

const router = express.Router();

// Check installation status
router.get('/status', async (req, res) => {
  try {
    const isInstalled = process.env.INSTALLATION_COMPLETE === 'true';
    res.json({ installed: isInstalled });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test database connection
router.post('/test-db', async (req, res) => {
  const { dbType, host, port, database, username, password, sqlitePath } = req.body;
  
  try {
    // Temporarily set environment variables for testing
    const originalEnv = { ...process.env };
    
    process.env.DB_TYPE = dbType;
    process.env.DB_HOST = host;
    process.env.DB_PORT = port;
    process.env.DB_NAME = database;
    process.env.DB_USER = username;
    process.env.DB_PASSWORD = password;
    if (sqlitePath) process.env.SQLITE_PATH = sqlitePath;
    
    await setupDatabase();
    
    // Test a simple query
    await query('SELECT 1 as test');
    
    // Restore original environment
    Object.assign(process.env, originalEnv);
    
    res.json({ success: true, message: 'Database connection successful' });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(400).json({ error: error.message });
  }
});

// Install application
router.post('/install', async (req, res) => {
  try {
    const {
      dbConfig,
      adminUser,
      appConfig
    } = req.body;
    
    // Update environment variables
    const envContent = `# Database Configuration
DB_TYPE=${dbConfig.dbType}
DB_HOST=${dbConfig.host || ''}
DB_PORT=${dbConfig.port || ''}
DB_NAME=${dbConfig.database || ''}
DB_USER=${dbConfig.username || ''}
DB_PASSWORD=${dbConfig.password || ''}
SQLITE_PATH=${dbConfig.sqlitePath || ''}
DB_SSL=${dbConfig.ssl || false}

# Application Configuration
NODE_ENV=production
PORT=${appConfig.port || 3001}
FRONTEND_URL=${appConfig.frontendUrl || 'http://localhost:5173'}
JWT_SECRET=${generateRandomSecret()}
JWT_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=${appConfig.smtpHost || ''}
SMTP_PORT=${appConfig.smtpPort || 587}
SMTP_USER=${appConfig.smtpUser || ''}
SMTP_PASSWORD=${appConfig.smtpPassword || ''}
SMTP_FROM=${appConfig.smtpFrom || ''}

# File Upload
MAX_FILE_SIZE=10MB
UPLOAD_PATH=uploads

# Installation Status
INSTALLATION_COMPLETE=true
`;

    await fs.writeFile(path.join(__dirname, '../../.env'), envContent);
    
    // Reload environment
    require('dotenv').config({ path: path.join(__dirname, '../../.env') });
    
    // Setup database connection
    await setupDatabase();
    
    // Run migrations
    await runMigrations();
    
    // Create admin user
    const hashedPassword = await bcrypt.hash(adminUser.password, 12);
    await execute(`
      INSERT INTO users (email, password, name, role, created_at)
      VALUES (?, ?, ?, 'manager', NOW())
    `, [adminUser.email, hashedPassword, adminUser.name]);
    
    // Seed initial data
    await seedInitialData();
    
    res.json({ 
      success: true, 
      message: 'Installation completed successfully' 
    });
  } catch (error) {
    console.error('Installation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

function generateRandomSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function seedInitialData() {
  // Seed product configuration
  const productTypes = ['T-shirt', 'Jersey', 'Polo Shirt', 'Hoodie'];
  const colors = ['White', 'Black', 'Red', 'Blue', 'Green', 'Yellow', 'Navy', 'Gray'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  
  // Insert product types
  for (let i = 0; i < productTypes.length; i++) {
    await execute(`
      INSERT INTO product_config (config_type, config_value, display_order, is_active, created_date)
      VALUES ('product_type', ?, ?, true, NOW())
    `, [productTypes[i], i + 1]);
  }
  
  // Insert colors
  for (let i = 0; i < colors.length; i++) {
    await execute(`
      INSERT INTO product_config (config_type, config_value, display_order, is_active, created_date)
      VALUES ('color', ?, ?, true, NOW())
    `, [colors[i], i + 1]);
  }
  
  // Insert sizes
  for (let i = 0; i < sizes.length; i++) {
    await execute(`
      INSERT INTO product_config (config_type, config_value, display_order, is_active, created_date)
      VALUES ('size', ?, ?, true, NOW())
    `, [sizes[i], i + 1]);
  }
  
  // Insert initial stock items
  for (const productType of productTypes) {
    for (const color of colors) {
      for (const size of sizes) {
        await execute(`
          INSERT INTO stock_items (product_type, color, size, quantity, min_threshold)
          VALUES (?, ?, ?, 0, 10)
        `, [productType, color, size]);
      }
    }
  }
}

module.exports = router;