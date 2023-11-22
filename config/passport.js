const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { user } = require("../models/index");

const googleClientID = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const googleStrategyConfig = new GoogleStrategy(
  {
    clientID: googleClientID,
    clientSecret: googleClientSecret,
    callbackURL: "/auth/google/callback",
    scope: ["email", "profile"]
  },
  (accessToken, refreshToken, profile, cb) => {
    if (err) return cb(err);
  }
);
