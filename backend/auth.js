const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('./models/User');

// Configure Discord Strategy
passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const OWNER_DISCORD_ID = '339703905166426114';
      
      // Find or create user
      let user = await User.findOne({ discord_id: profile.id });
      
      if (user) {
        // Update existing user
        user.username = profile.username;
        user.discriminator = profile.discriminator;
        user.avatar = profile.avatar;
        user.email = profile.email;
        user.access_token = accessToken;
        user.refresh_token = refreshToken;
        user.last_login = new Date();
        user.last_activity = new Date();
        
        // Set owner role if this is the owner's first login after update
        if (profile.id === OWNER_DISCORD_ID && user.role !== 'owner') {
          user.role = 'owner';
          user.status = 'approved';
        }
        
        await user.save();
      } else {
        // Create new user with appropriate role and status
        const isOwner = profile.id === OWNER_DISCORD_ID;
        
        user = await User.create({
          discord_id: profile.id,
          username: profile.username,
          discriminator: profile.discriminator,
          avatar: profile.avatar,
          email: profile.email,
          access_token: accessToken,
          refresh_token: refreshToken,
          role: isOwner ? 'owner' : 'user',
          status: isOwner ? 'approved' : 'pending',
          last_login: new Date(),
          last_activity: new Date()
        });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Auth middleware - checks if user is authenticated AND approved
const isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated. Please login with Discord.'
    });
  }
  
  if (req.user.status !== 'approved') {
    return res.status(403).json({
      success: false,
      error: 'Access pending approval. Please wait for admin approval.'
    });
  }
  
  if (req.user.status === 'banned') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Your account has been banned.'
    });
  }
  
  // Update last activity
  req.user.last_activity = new Date();
  req.user.save().catch(err => console.error('Error updating last activity:', err));
  
  return next();
};

// Admin middleware - checks if user is admin or owner
const isAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated. Please login with Discord.'
    });
  }
  
  if (req.user.role !== 'admin' && req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin privileges required.'
    });
  }
  
  return next();
};

// Owner middleware - checks if user is owner
const isOwner = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated. Please login with Discord.'
    });
  }
  
  if (req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Owner privileges required.'
    });
  }
  
  return next();
};

module.exports = {
  passport,
  isAuthenticated,
  isAdmin,
  isOwner
};

