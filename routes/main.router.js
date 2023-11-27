const express = require("express");
const mainRouter = express.Router();
const { Posts, Users, User_infos, Comments, Likes, sequelize } = require("../models");
const passport = require("passport");
const { regionEnum } = require("../config/enum.js");
const { authMiddleware, checkAuth } = require("../middlewares/auth-middleware");

mainRouter.get("/", (req, res) => {
  res.redirect("/posts");
});

// 메인페이지
mainRouter.get("/posts", [checkAuth, authMiddleware], async (req, res, next) => {
  const sort = req.query.sort ? req.query.sort : "DESC";
  const userId = res.locals.currentUser;

  const posts = await Posts.findAll({
    attributes: [
      "userId",
      "postId",
      "title",
      "subtitle",
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
// 상세 페이지
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
    for (const key in comments) {
      const name = await Users.findOne({
        attributes: ["username"],
        where: comments[key].dataValues.userId
      });
      const newComment = {
        ...comments[key].dataValues,
        username: name.dataValues.username
      };
      newComments.push(newComment);
    }
  }
  const newPost = {
    ...post.dataValues
  };
  const count = await Likes.count({
    where: { userId, targetId: postId, target_type: "post" }
  });
  let postLike = false;
  if (count !== 0) {
    postLike = await Likes.findOne({
      attributes: ["state"],
      where: { targetId: postId }
    });
  }

  res.cookie("accessToken", res.locals.accessToken);
  res.render("post_detail/", {
    currentUser: userId,
    currentUsername: newPost.username,
    posts: newPost,
    comments: newComments,
    postLike: postLike ? postLike.dataValues.state : false
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

  res.cookie("accessToken", res.locals.accessToken).render("post_detail/edit.ejs", {
    post: post.dataValues,
    currentUser: res.locals.currentUser,
    currentUsername: newPost.username
  });
});
// 포스트 좋아요
mainRouter.get("/posts/:postId/likes", [checkAuth, authMiddleware], async (req, res) => {
  const userId = res.locals.currentUser;
  const { postId } = req.params;

  const countLikes = await Likes.count({
    where: { userId, targetId: postId, target_type: "post" }
  });
  console.log(countLikes);
  if (countLikes === 0) {
    await Likes.create({ userId, targetId: postId, target_type: "post", state: true });
    return res.redirect("back");
  } else {
    const checkLikes = await Likes.findOne({
      attributes: ["likeId", "state"],
      where: { userId, targetId: postId, target_type: "post" }
    });

    const likeState = checkLikes.dataValues.state;
    await Likes.update(
      {
        state: !likeState
      },
      {
        where: { userId, targetId: postId, target_type: "post" }
      }
    ).then(() => {
      return res.redirect("back");
    });
  }
});

// 댓글 수정 등록
mainRouter.get("/comments/:commentsId", [checkAuth, authMiddleware], async (req, res, next) => {
  const commentsId = req.params.commentsId;
  const comments = await Comments.findOne({
    where: { commentsId }
  });
  console.log(comments.dataValues);
  res.cookie("accessToken", res.locals.accessToken);
  res.render("comments/edit.ejs", {
    comments: comments.dataValues,
    currentUser: res.locals.currentUser
  });
});
// 유저 정보 수정
mainRouter.get("/user/:userId", [checkAuth, authMiddleware], async (req, res, next) => {
  const { userId } = req.params;

  const userInfo = await User_infos.count({
    where: {
      userId: userId
    }
  });

  if (userInfo === 0) {
    const user_infos = new User_infos({
      userId,
      profile: null,
      region: null,
      nation: null
    });

    const temp = await user_infos.save();
  }

  const user = await User_infos.findOne({
    where: {
      userId: userId
    }
  });

  res.render("mypage", {
    currentUser: userId,
    userInfo: user.dataValues
  });
});

// 회원가입
mainRouter.get("/signup", (req, res) => {
  res.cookie("accessToken", res.locals.accessToken).render("auth/signup", {
    User: null
  });
});
// 로그인
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

// 로그아웃 API
mainRouter.get("/auth/logout", (req, res, next) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.redirect("/login");
});

module.exports = mainRouter;
