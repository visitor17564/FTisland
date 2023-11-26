// import
const jwt = require("jsonwebtoken");
const { Posts } = require("../models");
const { redis } = require("../config/config");
require("dotenv").config();

// auth middleware - global variables
const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET_KEY;

// middleware
const authMiddleware = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;
  const verifiedAccessToken = verifyAccessToken(accessToken);

  if (verifiedAccessToken) {
    res.locals.currentUser = verifiedAccessToken.userId;
    next();
  }
  const verifiedRefreshToken = verifyRefreshToken(refreshToken);
  if (!verifiedRefreshToken) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.redirect("/login");
  }

  const getRedis = await redis.get(refreshToken);
  if (!getRedis) {
    console.log("DB에 없음");
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    return res.redirect("/login");
  }

  if (getRedis === verifiedAccessToken.userId) {
    console.log("!!");
  }
  const newAccessToken = jwt.sign({ userId: getRedis }, accessTokenSecretKey, {
    expiresIn: "6h"
  });
  res.locals.currentUser = getRedis;
  res.locals.accessToken = newAccessToken;
  next();
};

// token  확인
const checkAuth = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;
  if (accessToken && refreshToken) {
    next();
  } else {
    return res.redirect("/login");
  }
};

function verifyAccessToken(accessTokenToken) {
  try {
    return jwt.verify(accessTokenToken, accessTokenSecretKey);
  } catch (error) {
    return false;
  }
}

function verifyRefreshToken(refreshTokenToken) {
  try {
    return jwt.verify(refreshTokenToken, refreshTokenSecretKey);
  } catch (error) {
    return false;
  }
}

module.exports = {
  authMiddleware,
  checkAuth
};
