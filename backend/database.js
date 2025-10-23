const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'g2g-crm.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
function initDatabase() {
  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      api_key TEXT,
      api_base_url TEXT DEFAULT 'https://prod.your-api-server.com',
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id TEXT PRIMARY KEY,
      seller_store_name TEXT,
      seller_id TEXT,
      buyer_id TEXT,
      order_status TEXT,
      amount REAL,
      unit_price REAL,
      currency TEXT,
      purchased_qty INTEGER,
      delivered_qty INTEGER,
      refunded_qty INTEGER,
      defected_qty INTEGER,
      replacement_qty INTEGER,
      created_at INTEGER,
      updated_at INTEGER,
      fetched_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      data_json TEXT
    )
  `);

  // Offers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS offers (
      offer_id TEXT PRIMARY KEY,
      seller_id TEXT,
      offer_type TEXT,
      product_id TEXT,
      service_id TEXT,
      brand_id TEXT,
      region_id TEXT,
      title TEXT,
      description TEXT,
      status TEXT,
      currency TEXT,
      unit_price REAL,
      min_qty INTEGER,
      available_qty INTEGER,
      api_qty INTEGER,
      low_stock_alert_qty INTEGER,
      created_at INTEGER,
      updated_at INTEGER,
      fetched_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      data_json TEXT
    )
  `);

  // Services table
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      service_id TEXT PRIMARY KEY,
      service_name TEXT,
      delivery_method TEXT,
      fetched_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // Brands table
  db.exec(`
    CREATE TABLE IF NOT EXISTS brands (
      brand_id TEXT PRIMARY KEY,
      service_id TEXT,
      brand_name TEXT,
      fetched_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (service_id) REFERENCES services(service_id)
    )
  `);

  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      product_id TEXT PRIMARY KEY,
      product_name TEXT,
      service_id TEXT,
      service_name TEXT,
      brand_id TEXT,
      brand_name TEXT,
      region_name TEXT,
      fetched_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // Inventory items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      item_id TEXT PRIMARY KEY,
      offer_id TEXT,
      content TEXT,
      content_type TEXT,
      reference_id TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // Webhook logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS webhook_logs (
      event_id TEXT PRIMARY KEY,
      event_type TEXT,
      webhook_url TEXT,
      http_status INTEGER,
      response_time INTEGER,
      event_sent_at INTEGER,
      data_json TEXT,
      fetched_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // Insert default settings if none exist
  const settings = db.prepare('SELECT COUNT(*) as count FROM settings').get();
  if (settings.count === 0) {
    db.prepare('INSERT INTO settings (api_base_url) VALUES (?)').run('https://prod.your-api-server.com');
  }

  console.log('✅ Database initialized successfully');
}

// Settings operations
const settingsOps = {
  get: () => {
    return db.prepare('SELECT * FROM settings ORDER BY id DESC LIMIT 1').get();
  },
  
  upsert: (apiKey, baseUrl) => {
    const existing = settingsOps.get();
    const now = Date.now();
    
    if (existing) {
      return db.prepare(`
        UPDATE settings 
        SET api_key = ?, api_base_url = ?, updated_at = ?
        WHERE id = ?
      `).run(apiKey, baseUrl, now, existing.id);
    } else {
      return db.prepare(`
        INSERT INTO settings (api_key, api_base_url, created_at, updated_at)
        VALUES (?, ?, ?, ?)
      `).run(apiKey, baseUrl, now, now);
    }
  },

  clear: () => {
    return db.prepare('DELETE FROM settings').run();
  }
};

// Orders operations
const ordersOps = {
  get: (orderId) => {
    return db.prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId);
  },
  
  getAll: () => {
    return db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  },
  
  upsert: (orderData) => {
    const existing = ordersOps.get(orderData.order_id);
    const now = Date.now();
    
    if (existing) {
      return db.prepare(`
        UPDATE orders 
        SET seller_store_name = ?, seller_id = ?, buyer_id = ?, order_status = ?,
            amount = ?, unit_price = ?, currency = ?, purchased_qty = ?,
            delivered_qty = ?, refunded_qty = ?, defected_qty = ?, replacement_qty = ?,
            updated_at = ?, fetched_at = ?, data_json = ?
        WHERE order_id = ?
      `).run(
        orderData.seller_store_name, orderData.seller_id, orderData.buyer_id, 
        orderData.order_status, orderData.amount, orderData.unit_price, 
        orderData.currency, orderData.purchased_qty, orderData.delivered_qty,
        orderData.refunded_qty, orderData.defected_qty, orderData.replacement_qty,
        orderData.updated_at, now, JSON.stringify(orderData), orderData.order_id
      );
    } else {
      return db.prepare(`
        INSERT INTO orders (
          order_id, seller_store_name, seller_id, buyer_id, order_status,
          amount, unit_price, currency, purchased_qty, delivered_qty,
          refunded_qty, defected_qty, replacement_qty, created_at, updated_at,
          fetched_at, data_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        orderData.order_id, orderData.seller_store_name, orderData.seller_id, 
        orderData.buyer_id, orderData.order_status, orderData.amount, 
        orderData.unit_price, orderData.currency, orderData.purchased_qty,
        orderData.delivered_qty, orderData.refunded_qty, orderData.defected_qty,
        orderData.replacement_qty, orderData.created_at, orderData.updated_at,
        now, JSON.stringify(orderData)
      );
    }
  }
};

// Offers operations
const offersOps = {
  get: (offerId) => {
    return db.prepare('SELECT * FROM offers WHERE offer_id = ?').get(offerId);
  },
  
  getAll: () => {
    return db.prepare('SELECT * FROM offers ORDER BY created_at DESC').all();
  },
  
  upsert: (offerData) => {
    const existing = offersOps.get(offerData.offer_id);
    const now = Date.now();
    
    if (existing) {
      return db.prepare(`
        UPDATE offers 
        SET seller_id = ?, offer_type = ?, product_id = ?, service_id = ?,
            brand_id = ?, region_id = ?, title = ?, description = ?, status = ?,
            currency = ?, unit_price = ?, min_qty = ?, available_qty = ?,
            api_qty = ?, low_stock_alert_qty = ?, updated_at = ?, fetched_at = ?,
            data_json = ?
        WHERE offer_id = ?
      `).run(
        offerData.seller_id, offerData.offer_type, offerData.product_id,
        offerData.service_id, offerData.brand_id, offerData.region_id,
        offerData.title, offerData.description, offerData.status,
        offerData.currency, offerData.unit_price, offerData.min_qty,
        offerData.available_qty, offerData.api_qty, offerData.low_stock_alert_qty,
        offerData.updated_at, now, JSON.stringify(offerData), offerData.offer_id
      );
    } else {
      return db.prepare(`
        INSERT INTO offers (
          offer_id, seller_id, offer_type, product_id, service_id, brand_id,
          region_id, title, description, status, currency, unit_price, min_qty,
          available_qty, api_qty, low_stock_alert_qty, created_at, updated_at,
          fetched_at, data_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        offerData.offer_id, offerData.seller_id, offerData.offer_type,
        offerData.product_id, offerData.service_id, offerData.brand_id,
        offerData.region_id, offerData.title, offerData.description,
        offerData.status, offerData.currency, offerData.unit_price,
        offerData.min_qty, offerData.available_qty, offerData.api_qty,
        offerData.low_stock_alert_qty, offerData.created_at, offerData.updated_at,
        now, JSON.stringify(offerData)
      );
    }
  },
  
  delete: (offerId) => {
    return db.prepare('DELETE FROM offers WHERE offer_id = ?').run(offerId);
  }
};

// Services operations
const servicesOps = {
  getAll: () => {
    return db.prepare('SELECT * FROM services ORDER BY service_name').all();
  },
  
  upsert: (serviceData) => {
    const now = Date.now();
    return db.prepare(`
      INSERT OR REPLACE INTO services (service_id, service_name, delivery_method, fetched_at)
      VALUES (?, ?, ?, ?)
    `).run(serviceData.service_id, serviceData.service_name, serviceData.delivery_method, now);
  },
  
  bulkUpsert: (services) => {
    const insert = db.prepare(`
      INSERT OR REPLACE INTO services (service_id, service_name, delivery_method, fetched_at)
      VALUES (?, ?, ?, ?)
    `);
    const now = Date.now();
    
    const insertMany = db.transaction((items) => {
      for (const item of items) {
        insert.run(item.service_id, item.service_name, item.delivery_method, now);
      }
    });
    
    insertMany(services);
  }
};

// Brands operations
const brandsOps = {
  getByService: (serviceId) => {
    return db.prepare('SELECT * FROM brands WHERE service_id = ? ORDER BY brand_name').all(serviceId);
  },
  
  bulkUpsert: (brands, serviceId) => {
    const insert = db.prepare(`
      INSERT OR REPLACE INTO brands (brand_id, service_id, brand_name, fetched_at)
      VALUES (?, ?, ?, ?)
    `);
    const now = Date.now();
    
    const insertMany = db.transaction((items) => {
      for (const item of items) {
        insert.run(item.brand_id, serviceId, item.brand_name, now);
      }
    });
    
    insertMany(brands);
  }
};

// Products operations
const productsOps = {
  getByBrand: (serviceId, brandId) => {
    return db.prepare(`
      SELECT * FROM products 
      WHERE service_id = ? AND brand_id = ? 
      ORDER BY product_name
    `).all(serviceId, brandId);
  },
  
  bulkUpsert: (products) => {
    const insert = db.prepare(`
      INSERT OR REPLACE INTO products (
        product_id, product_name, service_id, service_name, 
        brand_id, brand_name, region_name, fetched_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const now = Date.now();
    
    const insertMany = db.transaction((items) => {
      for (const item of items) {
        insert.run(
          item.product_id, item.product_name, item.service_id, 
          item.service_name, item.brand_id, item.brand_name, 
          item.region_name, now
        );
      }
    });
    
    insertMany(products);
  }
};

// Inventory operations
const inventoryOps = {
  getByOffer: (offerId) => {
    return db.prepare('SELECT * FROM inventory_items WHERE offer_id = ? ORDER BY created_at DESC').all(offerId);
  },
  
  insert: (itemData) => {
    const now = Date.now();
    return db.prepare(`
      INSERT INTO inventory_items (item_id, offer_id, content, content_type, reference_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(itemData.item_id, itemData.offer_id, itemData.content, itemData.content_type, itemData.reference_id, now);
  },
  
  delete: (itemId) => {
    return db.prepare('DELETE FROM inventory_items WHERE item_id = ?').run(itemId);
  }
};

// Webhook logs operations
const webhookLogsOps = {
  bulkUpsert: (logs) => {
    const insert = db.prepare(`
      INSERT OR REPLACE INTO webhook_logs (
        event_id, event_type, webhook_url, http_status, 
        response_time, event_sent_at, data_json, fetched_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const now = Date.now();
    
    const insertMany = db.transaction((items) => {
      for (const item of items) {
        insert.run(
          item.event_id, item.event_type, item.webhook_url, 
          item.http_status, item.response_time, item.event_sent_at,
          JSON.stringify(item), now
        );
      }
    });
    
    insertMany(logs);
  },
  
  getRecent: (limit = 50) => {
    return db.prepare('SELECT * FROM webhook_logs ORDER BY event_sent_at DESC LIMIT ?').all(limit);
  }
};

// Clear all cache
function clearAllCache() {
  db.prepare('DELETE FROM orders').run();
  db.prepare('DELETE FROM offers').run();
  db.prepare('DELETE FROM services').run();
  db.prepare('DELETE FROM brands').run();
  db.prepare('DELETE FROM products').run();
  db.prepare('DELETE FROM inventory_items').run();
  db.prepare('DELETE FROM webhook_logs').run();
  console.log('✅ All cache cleared');
}

module.exports = {
  db,
  initDatabase,
  settingsOps,
  ordersOps,
  offersOps,
  servicesOps,
  brandsOps,
  productsOps,
  inventoryOps,
  webhookLogsOps,
  clearAllCache
};

