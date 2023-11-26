const express = require("express");
const mainRouter = express.Router();
const { Posts, Users, User_infos, Comments, sequelize } = require("../models");

const { regionEnum } = require("../config/enum.js");
const { authMiddleware, checkAuth } = require("../middlewares/auth-middleware");

mainRouter.get("/", (req, res) => {
  res.redirect("/posts");
});

// get all posts
mainRouter.get("/posts", [checkAuth, authMiddleware], async (req, res, next) => {
  const cookieAccessToken = req.cookies.accessToken;
  const sort = req.query.sort ? req.query.sort : "DESC";
  const userId = res.locals.currentUser;
  const accessToken = res.locals.accessToken;

  console.log("쿠키", cookieAccessToken);
  console.log("로컬", accessToken);
  const posts = await Posts.findAll({
    attributes: [
      "userId",
      "postId",
      "title",
      "region",
      "contents",
      "like",
      [sequelize.col("username"), "username"],
      "updatedAt"
    ],
    order: [["createdAt", sort]],
    include: {
      model: Users,
      attributes: []
    }
  });
  const username = await Users.findOne({
    attributes: ["username"],
    where: {
      userId
    }
  });

  if (!posts) {
    return res.status(500).json({
      success: false,
      message: "관광지를 조회할 수 없습니다."
    });
  }

  res.cookie("accessToken", res.locals.accessToken);
  res.render("posts", {
    regions: regionEnum,
    posts: posts,
    currentUser: userId,
    currentUsername: username.dataValues.username
  });
});

mainRouter.get("/posts/:postId", [checkAuth, authMiddleware], async (req, res, next) => {
  const userId = res.locals.currentUser;
  const postId = req.params.postId;
  const sort = req.query.sort ? req.query.sort : "DESC";
  const post = await Posts.findOne({
    where: { postId },
    attributes: [
      "postId",
      "userId",
      "title",
      "subtitle",
      "region",
      "contents",
      "state",
      [sequelize.col("username"), "username"],
      "createdAt"
    ],
    include: [
      {
        model: Users,
        attributes: []
      }
    ]
  });
  if (!post) {
    next(new Error(`NotPostFound`));
  }

  const comments = await Comments.findAll({
    where: { postId },
    attributes: ["commentsId", "postId", "userId", "text", "like", "updatedAt"],
    order: [["createdAt", sort]]
  });
  const newComments = [];
  if (comments) {
    for (const comment of comments) {
      const name = await Users.findOne({
        attributes: ["username"],
        where: comment.dataValues.userId
      });
      const newComment = {
        ...comment.dataValues,
        username: name.dataValues.username
      };
      newComments.push(newComment);
    }
  }
  const newPost = {
    ...post.dataValues
  };
  console.log(newPost);
  console.log(userId);
  res.cookie("accessToken", res.locals.accessToken);
  res.render("post_detail/", {
    currentUser: userId,
    currentUsername: newPost.username,
    posts: newPost,
    comments: newComments
  });
});

mainRouter.get("/posts/:postId/edit", [checkAuth, authMiddleware], async (req, res, next) => {
  // 포스트 작성자 검증 미들웨어 생성 고민해보자
  const postId = req.params.postId;

  const post = await Posts.findOne({
    where: { postId },
    attributes: [
      "postId",
      "userId",
      "title",
      "region",
      "contents",
      [sequelize.col("username"), "username"],
      "createdAt"
    ],
    include: [
      {
        model: Users,
        attributes: []
      }
    ]
  });
  const newPost = {
    ...post.dataValues
  };
  console.log(newPost);
  res.cookie("accessToken", res.locals.accessToken).render("post_detail/edit.ejs", {
    post: post.dataValues,
    currentUser: res.locals.currentUser,
    currentUsername: newPost.username
  });
});

mainRouter.get("/comments/:commentsId", [checkAuth, authMiddleware], async (req, res, next) => {
  const commentsId = req.params.commentsId;

  const comments = await Comments.findOne({
    where: { commentsId }
  });
  console.log(comments.dataValues);
  res.cookie("accessToken", res.locals.accessToken).render("comments/edit.ejs", {
    comments: comments.dataValues
  });
});

mainRouter.get("/user/:id", authMiddleware, async (req, res, next) => {
  console.log("!");
  const userId = res.locals.currentUser;
  const postId = req.params.postId;

  const { profile, region, nation } = req.body;

  const user_info = await User_infos.findOne({
    where: { userId: userId }
  });
  const userInfo = {
    profile: null,
    region: null,
    nation: null
  };
  if (user_info) {
    console.log(user_info);
  }
});

mainRouter.get("/signup", (req, res) => {
  res.cookie("accessToken", res.locals.accessToken).render("auth/signup", {
    User: null
  });
});

mainRouter.get("/login", (req, res) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;
  if (accessToken && refreshToken) {
    res.redirect("/posts");
  } else {
    res.cookie("accessToken", res.locals.accessToken).render("auth/login", {
      User: null
    });
  }
});

module.exports = mainRouter;
