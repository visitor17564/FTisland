const express = require("express");
const mainRouter = express.Router();
const { Posts, user } = require("../models");
const temp = ["서울", "경기", "인천", "강원"];

const { checkAuth } = require("../middlewares/auth-middleware");

mainRouter.get("/", (req, res) => {
  res.redirect("/posts");
});

// get all posts
mainRouter.get("/posts", checkAuth, async (req, res) => {
  const post = await Posts.findAll({});
  const user = {
    userId: 1,
    username: "이하늘"
  };
  if (!post) {
    return res.status(500).json({
      success: false,
      message: "관광지를 조회할 수 없습니다."
    });
  }

  res.render("posts", {
    regions: temp,
    posts: post,
    User: user
  });
});

mainRouter.get("/posts/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Posts.findOne({
      where: { postId },
      attributes: ["postId", "userId", "title", "subtitle", "region", "contents", "state"],
      include: [
        {
          model: Users,
          attributes: ["email"]
        }
      ]
    });
    if (!post.dataValues) {
      return res.status(500).json({
        success: false,
        message: "관광지 조회에 실패 하였습니다."
      });
    }
    return res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "서버에러."
    });
  }
});

mainRouter.get("/signup", (req, res) => {
  res.render("auth/signup");
});

mainRouter.get("/login", (req, res) => {
  res.render("auth/login");
});

module.exports = mainRouter;
