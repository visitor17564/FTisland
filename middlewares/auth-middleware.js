// import
const jwt = require("jsonwebtoken");
const { Users } = require("../models");
const { redis } = require("../config/config");
require("dotenv").config();

// auth middleware - global variables
const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET_KEY;

// middleware
const authMiddleware = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  jwt.verify(accessToken, accessTokenSecretKey, (err, user) => {
    if (err) {
      return res.redirect("/api/auth/refresh");
    }
    req.user = user;
    next();
  });
};

// 로그인 상태 확인 검증값으로 바꿔야됨
const checkAuth = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;
  if (accessToken && refreshToken) {
    next();
  } else {
    res.redirect("/login");
  }
};

module.exports = {
  authMiddleware,
  checkAuth
};
