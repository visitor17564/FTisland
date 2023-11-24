// import
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Users } = require("../models");
const { redis } = require("../config/config");
const { validatorErrorCheck } = require("../middlewares/validatorErrorCheck-middleware");
require("dotenv").config();

// auth.js - global variables
const router = express.Router();
const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET_KEY;

// 회원가입 API
router.post("/auth/signup", [
  // 빈 입력란 여부 체크 및 앞뒤 공백 제거
  body("email").notEmpty().trim().withMessage("이메일이 비어있습니다."),
  body("username").notEmpty().trim().withMessage("이름이 비어있습니다."),
  body("password").notEmpty().trim().withMessage("비밀번호가 비어있습니다."),
  body("confirmPassword").notEmpty().trim().withMessage("확인용 비밀번호가 비어있습니다."),

  // 이메일 형식 체크
  body("email").isEmail().isLength({max:30}).withMessage("올바른 이메일 형식이 아닙니다."),
  
  // 비밀번호 6자 이상, 일치 여부 확인
  body("password").isLength({min:6}).withMessage("비밀번호는 최소 6자 이상입니다."),
  body("confirmPassword").custom((confirmPassword, {req}) => {
    if(confirmPassword !== req.body.password) {
      return false;
    }
    return true;
  }).withMessage("비밀번호가 서로 일치하지 않습니다.")

], validatorErrorCheck, async (req, res) => {
  // 이메일, 유저네임, 비밀번호, 확인용비밀번호를 데이터로 넘겨받음
  const { email, username, password } = req.body;

  // 이메일이 중복되는지 확인하기 위해 가져온다.
  const existEmail = await Users.findAll({
    where: { email }
  });

  // 중복된 이메일 입력 확인
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
});

// 로그인 API
router.post("/auth/login", [
  // 빈 입력란 여부 체크 및 앞뒤 공백 제거
  body("email").notEmpty().trim().withMessage("이메일이 비어있습니다."),
  body("password").notEmpty().trim().withMessage("비밀번호가 비어있습니다."),

  // 이메일 형식 체크
  body("email").isEmail().isLength({max:30}).withMessage("올바른 이메일 형식이 아닙니다.")

], validatorErrorCheck, async (req, res) => {
  const { password } = res.locals.user;
  // 이메일, 비밀번호를 데이터로 넘겨받음
  const { email, confirmPassword } = req.body;

  // 해당 이메일을 가진 유저를 데이터베이스에서 찾는다.
  const user = await Users.findOne({
    where: { email }
  });
  if (!user) {
    return res.status(401).send({
      success: false,
      errorMessage: "해당 이메일을 가진 유저가 존재하지 않습니다."
    });
  }

  // 비밀번호 서로 일치여부 확인
  const hash = password;
  const isValidPass = await bcrypt.compare(confirmPassword, hash);

  if (!isValidPass) {
    return res.status(401).send({
      success: false,
      errorMessage: "비밀번호가 일치하지 않습니다."
    });
  }
  const accessToken = jwt.sign({ userId: user.userId }, accessTokenSecretKey, { expiresIn: "1h" });

  const refreshToken = jwt.sign({ userId: user.userId }, refreshTokenSecretKey, { expiresIn: "1d" });
  redis.connect();

  await redis.set(refreshToken, user.userId);
  await redis.expire(refreshToken, 60 * 60);

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.cookie("accessToken", accessToken);
  res.cookie("refreshToken", refreshToken);
  res.redirect("/posts");
});

// 로그아웃 API
router.get("/auth/logout", (req, res, next) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.render("posts", {
    User: null
  });
});

// router 모듈 내보내기
module.exports = router;
