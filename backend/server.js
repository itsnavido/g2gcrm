const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const {
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
} = require('./database');

const G2GAPI = require('./g2g-api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

// Helper to get G2G API client
function getG2GClient() {
  const settings = settingsOps.get();
  if (!settings || !settings.api_key) {
    throw new Error('API key not configured. Please configure in Settings.');
  }
  return new G2GAPI(settings.api_key, settings.api_base_url);
}

// ===== SETTINGS ROUTES =====

// Get settings
app.get('/api/settings', (req, res) => {
  try {
    const settings = settingsOps.get();
    res.json({
      success: true,
      data: settings || { api_base_url: 'https://prod.your-api-server.com' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save settings
app.post('/api/settings', (req, res) => {
  try {
    const { api_key, api_base_url } = req.body;
    
    if (!api_key) {
      return res.status(400).json({ success: false, error: 'API key is required' });
    }

    settingsOps.upsert(api_key, api_base_url || 'https://prod.your-api-server.com');
    
    res.json({
      success: true,
      message: 'Settings saved successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test connection
app.post('/api/settings/test', async (req, res) => {
  try {
    const { api_key, api_base_url } = req.body;
    const client = new G2GAPI(api_key, api_base_url);
    
    const result = await client.getServices();
    
    if (result.code === 20000001) {
      res.json({ success: true, message: 'Connection successful!' });
    } else {
      res.status(400).json({ success: false, error: 'Connection failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Connection failed' });
  }
});

// Clear cache
app.post('/api/settings/clear-cache', (req, res) => {
  try {
    clearAllCache();
    res.json({ success: true, message: 'Cache cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== ORDERS ROUTES =====

// Get all cached orders
app.get('/api/orders', (req, res) => {
  try {
    const orders = ordersOps.getAll();
    res.json({
      success: true,
      data: orders.map(order => ({
        ...order,
        data_json: order.data_json ? JSON.parse(order.data_json) : null
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific order (with caching)
app.get('/api/orders/:order_id', async (req, res) => {
  try {
    const { order_id } = req.params;
    const { refresh } = req.query;
    
    // Check cache first
    if (!refresh) {
      const cached = ordersOps.get(order_id);
      if (cached) {
        return res.json({
          success: true,
          data: {
            ...cached,
            data_json: cached.data_json ? JSON.parse(cached.data_json) : null
          },
          cached: true
        });
      }
    }
    
    // Fetch from API
    const client = getG2GClient();
    const result = await client.getOrder(order_id);
    
    if (result.code === 20000001 && result.payload) {
      // Save to cache
      ordersOps.upsert(result.payload);
      
      res.json({
        success: true,
        data: result.payload,
        cached: false
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.message || 'Order not found'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Deliver codes to order
app.post('/api/orders/:order_id/delivery', async (req, res) => {
  try {
    const { order_id } = req.params;
    const deliveryData = req.body;
    
    const client = getG2GClient();
    const result = await client.deliverCode(order_id, deliveryData);
    
    if (result.code === 20000001) {
      // Refresh order cache
      const orderResult = await client.getOrder(order_id);
      if (orderResult.payload) {
        ordersOps.upsert(orderResult.payload);
      }
      
      res.json({ success: true, data: result.payload });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Delivery failed'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get delivery status
app.get('/api/orders/:order_id/delivery/:delivery_id', async (req, res) => {
  try {
    const { order_id, delivery_id } = req.params;
    
    const client = getG2GClient();
    const result = await client.getDeliveryStatus(order_id, delivery_id);
    
    if (result.code === 20000001) {
      res.json({ success: true, data: result.payload });
    } else {
      res.status(404).json({
        success: false,
        error: result.message || 'Delivery not found'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== OFFERS ROUTES =====

// Get all cached offers
app.get('/api/offers', async (req, res) => {
  try {
    const { refresh } = req.query;
    
    const cached = offersOps.getAll();
    
    res.json({
      success: true,
      data: cached.map(offer => ({
        ...offer,
        data_json: offer.data_json ? JSON.parse(offer.data_json) : null
      })),
      cached: !refresh
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific offer
app.get('/api/offers/:offer_id', async (req, res) => {
  try {
    const { offer_id } = req.params;
    const { refresh } = req.query;
    
    // Check cache first
    if (!refresh) {
      const cached = offersOps.get(offer_id);
      if (cached) {
        return res.json({
          success: true,
          data: {
            ...cached,
            data_json: cached.data_json ? JSON.parse(cached.data_json) : null
          },
          cached: true
        });
      }
    }
    
    // Fetch from API
    const client = getG2GClient();
    const result = await client.getOffer(offer_id);
    
    if (result.code === 20000001 && result.payload) {
      // Save to cache
      offersOps.upsert(result.payload);
      
      res.json({
        success: true,
        data: result.payload,
        cached: false
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.message || 'Offer not found'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create offer
app.post('/api/offers', async (req, res) => {
  try {
    const offerData = req.body;
    
    const client = getG2GClient();
    const result = await client.createOffer(offerData);
    
    if (result.code === 20000001 && result.payload) {
      // Save to cache
      offersOps.upsert(result.payload);
      
      res.json({
        success: true,
        data: result.payload,
        message: 'Offer created successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to create offer'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update offer
app.patch('/api/offers/:offer_id', async (req, res) => {
  try {
    const { offer_id } = req.params;
    const offerData = req.body;
    
    const client = getG2GClient();
    const result = await client.updateOffer(offer_id, offerData);
    
    if (result.code === 20000001 && result.payload) {
      // Update cache
      offersOps.upsert(result.payload);
      
      res.json({
        success: true,
        data: result.payload,
        message: 'Offer updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to update offer'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete offer
app.delete('/api/offers/:offer_id', async (req, res) => {
  try {
    const { offer_id } = req.params;
    
    const client = getG2GClient();
    const result = await client.deleteOffer(offer_id);
    
    if (result.code === 20000001) {
      // Remove from cache
      offersOps.delete(offer_id);
      
      res.json({
        success: true,
        message: 'Offer deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to delete offer'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== SERVICES ROUTES =====

app.get('/api/services', async (req, res) => {
  try {
    const { refresh, language = 'en' } = req.query;
    
    // Check cache
    if (!refresh) {
      const cached = servicesOps.getAll();
      if (cached.length > 0) {
        return res.json({
          success: true,
          data: cached,
          cached: true
        });
      }
    }
    
    // Fetch from API
    const client = getG2GClient();
    const result = await client.getServices(language);
    
    if (result.code === 20000001 && result.payload) {
      // Save to cache
      if (result.payload.service_list) {
        servicesOps.bulkUpsert(result.payload.service_list);
      }
      
      res.json({
        success: true,
        data: result.payload.service_list || [],
        cached: false
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to fetch services'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== BRANDS ROUTES =====

app.get('/api/brands/:service_id', async (req, res) => {
  try {
    const { service_id } = req.params;
    const { refresh, language = 'en', q = '', after } = req.query;
    
    // Check cache
    if (!refresh && !q && !after) {
      const cached = brandsOps.getByService(service_id);
      if (cached.length > 0) {
        return res.json({
          success: true,
          data: cached,
          cached: true
        });
      }
    }
    
    // Fetch from API
    const client = getG2GClient();
    const result = await client.getBrands(service_id, q, after, language);
    
    if (result.code === 20000001 && result.payload) {
      // Save to cache
      if (result.payload.brand_list && !q && !after) {
        brandsOps.bulkUpsert(result.payload.brand_list, service_id);
      }
      
      res.json({
        success: true,
        data: result.payload.brand_list || [],
        after: result.payload.after,
        cached: false
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to fetch brands'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== PRODUCTS ROUTES =====

app.get('/api/products', async (req, res) => {
  try {
    const { service_id, brand_id, refresh } = req.query;
    
    if (!service_id || !brand_id) {
      return res.status(400).json({
        success: false,
        error: 'service_id and brand_id are required'
      });
    }
    
    // Check cache
    if (!refresh) {
      const cached = productsOps.getByBrand(service_id, brand_id);
      if (cached.length > 0) {
        return res.json({
          success: true,
          data: cached,
          cached: true
        });
      }
    }
    
    // Fetch from API
    const client = getG2GClient();
    const result = await client.getProducts(service_id, brand_id);
    
    if (result.code === 20000001 && result.payload) {
      // Save to cache
      if (result.payload.product_list) {
        productsOps.bulkUpsert(result.payload.product_list);
      }
      
      res.json({
        success: true,
        data: result.payload.product_list || [],
        cached: false
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to fetch products'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get product attributes
app.get('/api/products/:product_id/attributes', async (req, res) => {
  try {
    const { product_id } = req.params;
    
    const client = getG2GClient();
    const result = await client.getProductAttributes(product_id);
    
    if (result.code === 20000001) {
      res.json({
        success: true,
        data: result.payload || []
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to fetch attributes'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== INVENTORY ROUTES =====

// Upload code to inventory
app.post('/api/inventory/:offer_id', async (req, res) => {
  try {
    const { offer_id } = req.params;
    const codeData = req.body;
    
    const client = getG2GClient();
    const result = await client.uploadCode(offer_id, codeData);
    
    if (result.code === 20000001 && result.payload) {
      // Save to local inventory
      inventoryOps.insert({
        item_id: result.payload.item_id,
        offer_id: result.payload.offer_id,
        content: codeData.content,
        content_type: codeData.content_type,
        reference_id: codeData.reference_id
      });
      
      res.json({
        success: true,
        data: result.payload,
        message: 'Code uploaded successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to upload code'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get inventory items for an offer
app.get('/api/inventory/:offer_id', (req, res) => {
  try {
    const { offer_id } = req.params;
    const items = inventoryOps.getByOffer(offer_id);
    
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete inventory item
app.delete('/api/inventory/:offer_id/:item_id', async (req, res) => {
  try {
    const { offer_id, item_id } = req.params;
    
    const client = getG2GClient();
    const result = await client.deleteCode(offer_id, item_id);
    
    if (result.code === 20000001) {
      // Remove from local inventory
      inventoryOps.delete(item_id);
      
      res.json({
        success: true,
        message: 'Code deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to delete code'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== STORE ROUTES =====

app.get('/api/store', async (req, res) => {
  try {
    const client = getG2GClient();
    const result = await client.getStore();
    
    if (result.code === 20000001) {
      res.json({
        success: true,
        data: result.payload
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to fetch store settings'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== WEBHOOK LOGS ROUTES =====

app.post('/api/webhook-logs/search', async (req, res) => {
  try {
    const searchParams = req.body;
    
    const client = getG2GClient();
    const result = await client.searchWebhookLogs(searchParams);
    
    if (result.code === 20000001 && result.payload) {
      // Save to cache
      if (result.payload.results) {
        webhookLogsOps.bulkUpsert(result.payload.results);
      }
      
      res.json({
        success: true,
        data: result.payload
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to search webhook logs'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get recent webhook logs from cache
app.get('/api/webhook-logs', (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const logs = webhookLogsOps.getRecent(parseInt(limit));
    
    res.json({
      success: true,
      data: logs.map(log => ({
        ...log,
        data_json: log.data_json ? JSON.parse(log.data_json) : null
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== STATS ROUTE =====

app.get('/api/stats', (req, res) => {
  try {
    const orders = ordersOps.getAll();
    const offers = offersOps.getAll();
    const services = servicesOps.getAll();
    
    const totalOrders = orders.length;
    const totalOffers = offers.length;
    const activeOffers = offers.filter(o => o.status === 'live').length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    
    res.json({
      success: true,
      data: {
        totalOrders,
        totalOffers,
        activeOffers,
        totalRevenue,
        totalServices: services.length,
        recentOrders: orders.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 G2G CRM Backend running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

