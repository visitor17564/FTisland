const express = require("express");
const mainRouter = express.Router();
const { Posts, Users, User_infos } = require("../models");
const temp = ["서울", "경기", "인천", "강원"];

const { authMiddleware, checkAuth } = require("../middlewares/auth-middleware");

mainRouter.get("/", (req, res) => {
  res.redirect("/posts");
});

// get all posts
mainRouter.get("/posts", [checkAuth, authMiddleware], async (req, res, next) => {
  const post = await Posts.findAll();
  const user = req.user;

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

mainRouter.get("/posts/:postId", [checkAuth, authMiddleware], async (req, res, next) => {
  const { userId } = req.user;
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

  if (!post) {
    next(new Error(`NotPostFound`));
  }
  res.render("post_detail/", {
    userId: userId,
    post: post
  });
});

mainRouter.get("/user/:id", authMiddleware, async (req, res, next) => {
  try {
    const user = req.user;
    console.log(user.userId);
    const userId = user.userId;
    const { profile, region, nation, follow } = req.body;
    // 로그인한 사용자를 기반으로 userId가 일치하는 사용자의 정보를 찾는다.

    const user_info = await User_infos.findOne({
      where: { userId: userId }
    });

    // 사용자 정보가 존재하지 않으면 새로운 사용자 정보를 생성한다.
    const temp = {
      profile: "프로필테스트",
      region: "지역테스트",
      nation: "국가테스트",
      follow: "팔로우테스트"
    };
    if (!user_info) {
      await User_infos.create(temp);
    }

    res.status(200).json({
      success: true,
      message: "프로필 생성이 완료되었습니다.",
      data: user_info
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      errorMessage: "예기치 못한 오류가 발생하였습니다."
    });
    console.log(err);
  }
});

mainRouter.get("/signup", (req, res) => {
  res.render("auth/signup", {
    User: null
  });
});

mainRouter.get("/login", (req, res) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;
  if (accessToken && refreshToken) {
    res.redirect("/posts");
  } else {
    res.render("auth/login", {
      User: null
    });
  }
});

module.exports = mainRouter;
