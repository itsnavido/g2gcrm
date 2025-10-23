const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const connectDB = require('./database');
const { passport, isAuthenticated, isAdmin, isOwner } = require('./auth');
const G2GAPI = require('./g2g-api');

// Import Models
const Setting = require('./models/Setting');
const Order = require('./models/Order');
const Offer = require('./models/Offer');
const Service = require('./models/Service');
const Brand = require('./models/Brand');
const Product = require('./models/Product');
const InventoryItem = require('./models/InventoryItem');
const WebhookLog = require('./models/WebhookLog');
const User = require('./models/User');
const ActivityLog = require('./models/ActivityLog');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/g2g-crm',
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
};

// In production, add domain for cookie
if (process.env.NODE_ENV === 'production' && process.env.COOKIE_DOMAIN) {
  sessionConfig.cookie.domain = process.env.COOKIE_DOMAIN;
}

app.use(session(sessionConfig));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Helper to get G2G API client
async function getG2GClient() {
  const setting = await Setting.findOne().sort({ createdAt: -1 });
  if (!setting || !setting.api_key) {
    throw new Error('API key not configured. Please configure in Settings.');
  }
  return new G2GAPI(setting.api_key, setting.api_base_url);
}

// ===== ROOT ROUTE =====

// API Status endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'G2G CRM Backend API',
    authenticated: req.isAuthenticated(),
    role: req.user?.role || null,
    status: req.user?.status || null,
    endpoints: {
      auth: '/auth/discord',
      health: '/api/health',
      docs: 'https://github.com/itsnavido/g2gcrm'
    }
  });
});

// ===== AUTH ROUTES =====

// Discord OAuth login
app.get('/auth/discord', passport.authenticate('discord'));

// Discord OAuth callback
app.get('/auth/discord/callback',
  passport.authenticate('discord', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`
  }),
  (req, res) => {
    // Successful authentication
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  }
);

// Logout
app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Get current user
app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      success: true,
      user: {
        id: req.user.discord_id,
        username: req.user.username,
        discriminator: req.user.discriminator,
        avatar: req.user.avatar,
        email: req.user.email,
        role: req.user.role,
        status: req.user.status
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Not authenticated'
    });
  }
});

// Check auth status
app.get('/auth/status', (req, res) => {
  res.json({
    success: true,
    authenticated: req.isAuthenticated(),
    role: req.user?.role || null,
    status: req.user?.status || null
  });
});

// ===== ADMIN ROUTES =====

// Get all users (Admin only)
app.get('/api/admin/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-access_token -refresh_token')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// Approve user (Admin only)
app.post('/api/admin/users/:id/approve', isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    if (user.status === 'approved') {
      return res.json({
        success: true,
        message: 'User already approved',
        data: user
      });
    }
    
    user.status = 'approved';
    user.approved_by = req.user._id;
    user.approved_at = new Date();
    await user.save();
    
    // Log activity
    await ActivityLog.create({
      user_id: req.user._id,
      action: 'approve_user',
      target_user_id: user._id,
      details: {
        username: user.username,
        discord_id: user.discord_id
      }
    });
    
    res.json({
      success: true,
      message: 'User approved successfully',
      data: user
    });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve user'
    });
  }
});

// Ban user (Admin only)
app.post('/api/admin/users/:id/ban', isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    if (user.role === 'owner') {
      return res.status(403).json({
        success: false,
        error: 'Cannot ban the owner'
      });
    }
    
    if (user.role === 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        error: 'Only owner can ban admins'
      });
    }
    
    user.status = 'banned';
    await user.save();
    
    // Log activity
    await ActivityLog.create({
      user_id: req.user._id,
      action: 'ban_user',
      target_user_id: user._id,
      details: {
        username: user.username,
        discord_id: user.discord_id
      }
    });
    
    res.json({
      success: true,
      message: 'User banned successfully',
      data: user
    });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to ban user'
    });
  }
});

// Unban user (Admin only)
app.post('/api/admin/users/:id/unban', isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    if (user.status !== 'banned') {
      return res.json({
        success: true,
        message: 'User is not banned',
        data: user
      });
    }
    
    user.status = 'approved';
    await user.save();
    
    // Log activity
    await ActivityLog.create({
      user_id: req.user._id,
      action: 'unban_user',
      target_user_id: user._id,
      details: {
        username: user.username,
        discord_id: user.discord_id
      }
    });
    
    res.json({
      success: true,
      message: 'User unbanned successfully',
      data: user
    });
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unban user'
    });
  }
});

// Promote to admin (Owner only)
app.post('/api/admin/users/:id/promote', isOwner, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    if (user.role === 'owner') {
      return res.status(400).json({
        success: false,
        error: 'Cannot change owner role'
      });
    }
    
    if (user.role === 'admin') {
      return res.json({
        success: true,
        message: 'User is already an admin',
        data: user
      });
    }
    
    user.role = 'admin';
    user.status = 'approved'; // Auto-approve admins
    await user.save();
    
    // Log activity
    await ActivityLog.create({
      user_id: req.user._id,
      action: 'promote_admin',
      target_user_id: user._id,
      details: {
        username: user.username,
        discord_id: user.discord_id,
        previous_role: 'user'
      }
    });
    
    res.json({
      success: true,
      message: 'User promoted to admin successfully',
      data: user
    });
  } catch (error) {
    console.error('Error promoting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to promote user'
    });
  }
});

// Demote from admin (Owner only)
app.post('/api/admin/users/:id/demote', isOwner, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    if (user.role === 'owner') {
      return res.status(400).json({
        success: false,
        error: 'Cannot change owner role'
      });
    }
    
    if (user.role === 'user') {
      return res.json({
        success: true,
        message: 'User is not an admin',
        data: user
      });
    }
    
    user.role = 'user';
    await user.save();
    
    // Log activity
    await ActivityLog.create({
      user_id: req.user._id,
      action: 'demote_admin',
      target_user_id: user._id,
      details: {
        username: user.username,
        discord_id: user.discord_id,
        previous_role: 'admin'
      }
    });
    
    res.json({
      success: true,
      message: 'User demoted to regular user successfully',
      data: user
    });
  } catch (error) {
    console.error('Error demoting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to demote user'
    });
  }
});

// Get activity logs (Admin only)
app.get('/api/admin/logs', isAdmin, async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    const logs = await ActivityLog.find()
      .populate('user_id', 'username discord_id avatar role')
      .populate('target_user_id', 'username discord_id avatar role')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity logs'
    });
  }
});

// ===== SETTINGS ROUTES (Protected) =====

// Get settings
app.get('/api/settings', isAuthenticated, async (req, res) => {
  try {
    const setting = await Setting.findOne().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: setting || { api_base_url: 'https://prod.your-api-server.com' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save settings
app.post('/api/settings', isAuthenticated, async (req, res) => {
  try {
    const { api_key, api_base_url } = req.body;
    
    if (!api_key) {
      return res.status(400).json({ success: false, error: 'API key is required' });
    }

    // Delete all existing settings and create new one
    await Setting.deleteMany({});
    const setting = await Setting.create({
      api_key,
      api_base_url: api_base_url || 'https://prod.your-api-server.com'
    });
    
    res.json({
      success: true,
      message: 'Settings saved successfully',
      data: setting
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test connection
app.post('/api/settings/test', isAuthenticated, async (req, res) => {
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
app.post('/api/settings/clear-cache', isAuthenticated, async (req, res) => {
  try {
    await Promise.all([
      Order.deleteMany({}),
      Offer.deleteMany({}),
      Service.deleteMany({}),
      Brand.deleteMany({}),
      Product.deleteMany({}),
      InventoryItem.deleteMany({}),
      WebhookLog.deleteMany({})
    ]);
    res.json({ success: true, message: 'Cache cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== ORDERS ROUTES (Protected) =====

// Get all cached orders
app.get('/api/orders', isAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find().sort({ created_at: -1 });
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific order (with caching)
app.get('/api/orders/:order_id', isAuthenticated, async (req, res) => {
  try {
    const { order_id } = req.params;
    const { refresh } = req.query;
    
    // Check cache first
    if (!refresh) {
      const cached = await Order.findOne({ order_id });
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true
        });
      }
    }
    
    // Fetch from API
    const client = await getG2GClient();
    const result = await client.getOrder(order_id);
    
    if (result.code === 20000001 && result.payload) {
      // Save to cache
      await Order.findOneAndUpdate(
        { order_id },
        { ...result.payload, fetched_at: Date.now() },
        { upsert: true, new: true }
      );
      
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
app.post('/api/orders/:order_id/delivery', isAuthenticated, async (req, res) => {
  try {
    const { order_id } = req.params;
    const deliveryData = req.body;
    
    const client = await getG2GClient();
    const result = await client.deliverCode(order_id, deliveryData);
    
    if (result.code === 20000001) {
      // Refresh order cache
      const orderResult = await client.getOrder(order_id);
      if (orderResult.payload) {
        await Order.findOneAndUpdate(
          { order_id },
          { ...orderResult.payload, fetched_at: Date.now() },
          { upsert: true }
        );
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

// ===== OFFERS ROUTES (Protected) =====

// Get all cached offers
app.get('/api/offers', isAuthenticated, async (req, res) => {
  try {
    const offers = await Offer.find().sort({ created_at: -1 });
    res.json({
      success: true,
      data: offers
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific offer
app.get('/api/offers/:offer_id', isAuthenticated, async (req, res) => {
  try {
    const { offer_id } = req.params;
    const { refresh } = req.query;
    
    // Check cache first
    if (!refresh) {
      const cached = await Offer.findOne({ offer_id });
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true
        });
      }
    }
    
    // Fetch from API
    const client = await getG2GClient();
    const result = await client.getOffer(offer_id);
    
    if (result.code === 20000001 && result.payload) {
      // Save to cache
      await Offer.findOneAndUpdate(
        { offer_id },
        { ...result.payload, fetched_at: Date.now() },
        { upsert: true, new: true }
      );
      
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
app.post('/api/offers', isAuthenticated, async (req, res) => {
  try {
    const offerData = req.body;
    
    const client = await getG2GClient();
    const result = await client.createOffer(offerData);
    
    if (result.code === 20000001 && result.payload) {
      // Save to cache
      await Offer.findOneAndUpdate(
        { offer_id: result.payload.offer_id },
        { ...result.payload, fetched_at: Date.now() },
        { upsert: true, new: true }
      );
      
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
app.patch('/api/offers/:offer_id', isAuthenticated, async (req, res) => {
  try {
    const { offer_id } = req.params;
    const offerData = req.body;
    
    const client = await getG2GClient();
    const result = await client.updateOffer(offer_id, offerData);
    
    if (result.code === 20000001 && result.payload) {
      // Update cache
      await Offer.findOneAndUpdate(
        { offer_id },
        { ...result.payload, fetched_at: Date.now() },
        { upsert: true, new: true }
      );
      
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
app.delete('/api/offers/:offer_id', isAuthenticated, async (req, res) => {
  try {
    const { offer_id } = req.params;
    
    const client = await getG2GClient();
    const result = await client.deleteOffer(offer_id);
    
    if (result.code === 20000001) {
      // Remove from cache
      await Offer.deleteOne({ offer_id });
      
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

// ===== SERVICES ROUTES (Protected) =====

app.get('/api/services', isAuthenticated, async (req, res) => {
  try {
    const { refresh, language = 'en' } = req.query;
    
    // Check cache
    if (!refresh) {
      const cached = await Service.find();
      if (cached.length > 0) {
        return res.json({
          success: true,
          data: cached,
          cached: true
        });
      }
    }
    
    // Fetch from API
    const client = await getG2GClient();
    const result = await client.getServices(language);
    
    if (result.code === 20000001 && result.payload) {
      // Save to cache
      if (result.payload.service_list) {
        await Service.deleteMany({});
        await Service.insertMany(
          result.payload.service_list.map(s => ({...s, fetched_at: Date.now()}))
        );
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

// ===== BRANDS ROUTES (Protected) =====

app.get('/api/brands/:service_id', isAuthenticated, async (req, res) => {
  try {
    const { service_id } = req.params;
    const { refresh, language = 'en', q = '', after } = req.query;
    
    // Check cache
    if (!refresh && !q && !after) {
      const cached = await Brand.find({ service_id });
      if (cached.length > 0) {
        return res.json({
          success: true,
          data: cached,
          cached: true
        });
      }
    }
    
    // Fetch from API
    const client = await getG2GClient();
    const result = await client.getBrands(service_id, q, after, language);
    
    if (result.code === 20000001 && result.payload) {
      // Save to cache
      if (result.payload.brand_list && !q && !after) {
        await Brand.deleteMany({ service_id });
        await Brand.insertMany(
          result.payload.brand_list.map(b => ({...b, service_id, fetched_at: Date.now()}))
        );
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

// ===== PRODUCTS ROUTES (Protected) =====

app.get('/api/products', isAuthenticated, async (req, res) => {
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
      const cached = await Product.find({ service_id, brand_id });
      if (cached.length > 0) {
        return res.json({
          success: true,
          data: cached,
          cached: true
        });
      }
    }
    
    // Fetch from API
    const client = await getG2GClient();
    const result = await client.getProducts(service_id, brand_id);
    
    if (result.code === 20000001 && result.payload) {
      // Save to cache
      if (result.payload.product_list) {
        await Product.deleteMany({ service_id, brand_id });
        await Product.insertMany(
          result.payload.product_list.map(p => ({...p, service_id, brand_id, fetched_at: Date.now()}))
        );
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
app.get('/api/products/:product_id/attributes', isAuthenticated, async (req, res) => {
  try {
    const { product_id } = req.params;
    
    const client = await getG2GClient();
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

// ===== INVENTORY ROUTES (Protected) =====

// Upload code to inventory
app.post('/api/inventory/:offer_id', isAuthenticated, async (req, res) => {
  try {
    const { offer_id } = req.params;
    const codeData = req.body;
    
    const client = await getG2GClient();
    const result = await client.uploadCode(offer_id, codeData);
    
    if (result.code === 20000001 && result.payload) {
      // Save to local inventory
      await InventoryItem.create({
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
app.get('/api/inventory/:offer_id', isAuthenticated, async (req, res) => {
  try {
    const { offer_id } = req.params;
    const items = await InventoryItem.find({ offer_id }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete inventory item
app.delete('/api/inventory/:offer_id/:item_id', isAuthenticated, async (req, res) => {
  try {
    const { offer_id, item_id } = req.params;
    
    const client = await getG2GClient();
    const result = await client.deleteCode(offer_id, item_id);
    
    if (result.code === 20000001) {
      // Remove from local inventory
      await InventoryItem.deleteOne({ item_id });
      
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

// ===== STORE ROUTES (Protected) =====

app.get('/api/store', isAuthenticated, async (req, res) => {
  try {
    const client = await getG2GClient();
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

// ===== WEBHOOK LOGS ROUTES (Protected) =====

app.post('/api/webhook-logs/search', isAuthenticated, async (req, res) => {
  try {
    const searchParams = req.body;
    
    const client = await getG2GClient();
    const result = await client.searchWebhookLogs(searchParams);
    
    if (result.code === 20000001 && result.payload) {
      // Save to cache
      if (result.payload.results) {
        await WebhookLog.insertMany(
          result.payload.results.map(log => ({...log, fetched_at: Date.now()})),
          { ordered: false }
        ).catch(() => {}); // Ignore duplicates
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
app.get('/api/webhook-logs', isAuthenticated, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const logs = await WebhookLog.find()
      .sort({ event_sent_at: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== STATS ROUTE (Protected) =====

app.get('/api/stats', isAuthenticated, async (req, res) => {
  try {
    const [orders, offers, services] = await Promise.all([
      Order.find(),
      Offer.find(),
      Service.find()
    ]);
    
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

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    authenticated: req.isAuthenticated()
  });
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
  console.log(`🔐 Discord OAuth: http://localhost:${PORT}/auth/discord`);
});

// Import mongoose for health check
const mongoose = require('mongoose');

