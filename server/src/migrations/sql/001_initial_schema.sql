-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'agent',
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER DEFAULT 0,
  agent_code VARCHAR(255) DEFAULT '',
  first_name VARCHAR(255) DEFAULT '',
  last_name VARCHAR(255) DEFAULT '',
  phone VARCHAR(255) DEFAULT '',
  email VARCHAR(255) DEFAULT '',
  territory VARCHAR(255) DEFAULT '',
  commission_rate DECIMAL(5,2) DEFAULT 0,
  hire_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'Active',
  target_sales DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Stock items table
CREATE TABLE IF NOT EXISTS stock_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_type VARCHAR(255) DEFAULT '',
  color VARCHAR(255) DEFAULT '',
  size VARCHAR(255) DEFAULT '',
  quantity INTEGER DEFAULT 0,
  min_threshold INTEGER DEFAULT 10
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number VARCHAR(255) DEFAULT '',
  agent_id INTEGER DEFAULT 0,
  customer_name VARCHAR(255) DEFAULT '',
  customer_phone VARCHAR(255) DEFAULT '',
  customer_whatsapp VARCHAR(255) DEFAULT '',
  customer_address TEXT DEFAULT '',
  product_type VARCHAR(255) DEFAULT '',
  product_color VARCHAR(255) DEFAULT '',
  total_quantity INTEGER DEFAULT 0,
  size_breakdown TEXT DEFAULT '',
  special_instructions TEXT DEFAULT '',
  event_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivery_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  order_status VARCHAR(50) DEFAULT 'Pending',
  total_amount DECIMAL(10,2) DEFAULT 0,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  payment_status VARCHAR(50) DEFAULT 'Pending',
  order_type VARCHAR(50) DEFAULT 'Custom Order',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Product configuration table
CREATE TABLE IF NOT EXISTS product_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_type VARCHAR(255) DEFAULT '',
  config_value VARCHAR(255) DEFAULT '',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER DEFAULT 0,
  product_type VARCHAR(255) DEFAULT '',
  product_color VARCHAR(255) DEFAULT '',
  size_breakdown TEXT DEFAULT '{}',
  item_quantity INTEGER DEFAULT 0,
  unit_price DECIMAL(10,2) DEFAULT 0,
  item_total DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);