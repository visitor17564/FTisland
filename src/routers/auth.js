// import
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Users } = require("../../models");
const { redis } = require("../db/config");
const { body } = require("express-validator");
const { validatorLogin } = require("../middleware/validator.middleware");
require("dotenv").config();

// auth.js - global variables
const router = express.Router();
const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET_KEY;

redis.on("connect", () => {
  console.info("Redis connected!");
});
redis.on("error", (err) => {
  console.error("Redis Client Error", err);
});
redis.connect();

// 회원가입 API
router.post(
  "/auth/signup",
  [
    body("email").notEmpty().trim().withMessage("이메일이 비어있습니다."),
    body("username").notEmpty().trim().withMessage("이름이 비어있습니다."),
    body("password").notEmpty().trim().withMessage("비밀번호가 비어있습니다."),
    body("confirmPassword").notEmpty().trim().withMessage("확인용 비밀번호가 비어있습니다."),
    body("email").isEmail().isLength({ max: 30 }).withMessage("올바른 이메일 형식이 아닙니다."),
    body("password").isLength({ min: 6 }).withMessage("비밀번호는 최소 6자 이상입니다."),
    body("confirmPassword").isLength({ min: 6 }).withMessage("비밀번호는 최소 6자 이상입니다."),
    validatorLogin
  ],

  async (req, res) => {
    const { email, username, password } = req.body;
    const existEmail = await Users.findAll({
      where: { email }
    });

    if (existEmail.length > 0) {
      return res.status(409).send({
        success: false,
        errorMessage: "해당 이메일은 이미 사용 중입니다."
      });
    }
    // 비밀번호 hash
    const hashedPassword = await bcrypt.hash(password, 10);
    // 회원가입 성공 시 정보 반환
    await Users.create({ email, username, password: hashedPassword });

    res.redirect("/login");
  }
);

// 로그인 API
router.post(
  "/auth/login",
  [
    body("email")
      .notEmpty()
      .trim()
      .withMessage("이메일이 비어있습니다.")
      .isEmail()
      .isLength({ max: 30 })
      .withMessage("올바른 이메일 형식이 아닙니다."),
    body("password")
      .notEmpty()
      .trim()
      .withMessage("비밀번호가 비어있습니다.")
      .isLength({ min: 6 })
      .withMessage("비밀번호는 최소 6자 이상입니다."),
    validatorLogin
  ],
  async (req, res, next) => {
    const { email, password } = req.body;
    const user = await Users.findOne({
      where: { email }
    });
    if (!user) {
      return res.redirect("/login");
    }
    const hash = user.password;
    const isValidPass = await bcrypt.compare(password, hash);
    if (!isValidPass) {
      return res.redirect("/login");
    }
    const accessToken = jwt.sign({ userId: user.userId, username: user.username }, accessTokenSecretKey, {
      expiresIn: "1m"
    });
    const refreshToken = jwt.sign({ userId: user.userId }, refreshTokenSecretKey, { expiresIn: "1d" });

    await redis.set(refreshToken, user.userId);
    await redis.expire(refreshToken, 60 * 60 * 24);

    res.locals.currentUser = user.dataValues.userId;
    res.cookie("accessToken", accessToken);
    res.cookie("refreshToken", refreshToken);
    res.redirect("/posts");
  }
);

module.exports = router;
