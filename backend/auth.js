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
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          discord_id: profile.id,
          username: profile.username,
          discriminator: profile.discriminator,
          avatar: profile.avatar,
          email: profile.email,
          access_token: accessToken,
          refresh_token: refreshToken,
          last_login: new Date()
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

// Auth middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    success: false,
    error: 'Not authenticated. Please login with Discord.'
  });
};

module.exports = {
  passport,
  isAuthenticated
};

