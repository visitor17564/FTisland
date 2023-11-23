const express = require("express");
const mainRouter = express.Router();
const temp = ["서울", "경기", "인천", "강원"];

mainRouter.get("/login", (req, res) => {
  res.render("auth/login");
});

mainRouter.get("/signup", (req, res) => {
  res.render("auth/signup");
});

mainRouter.get("/post", (req, res) => {
  res.render("posts");
});

module.exports = mainRouter;
