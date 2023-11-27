const express = require("express");
const mainRouter = express.Router();

const { Posts, Users, User_infos, Comments, Likes, sequelize } = require("../../models");
const { regionEnum } = require("../common/enum");
const { authMiddleware, checkAuth } = require("../middleware/auth.middleware");

mainRouter.get("/", (req, res) => {
  res.redirect("/posts");
});

// 메인페이지
mainRouter.get("/posts", [checkAuth, authMiddleware], async (req, res, next) => {
  const sort = req.query.sort ? req.query.sort : "DESC";
  const userId = res.locals.currentUser;
  const queryRegion = req.query.mbti ? req.query.mbti : "전체";
  let posts;
  if (queryRegion === "전체") {
    posts = await Posts.findAll({
      attributes: [
        "postId",
        "userId",
        "title",
        "subtitle",
        "mbti",
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
  } else {
    posts = await Posts.findAll({
      attributes: [
        "postId",
        "userId",
        "title",
        "subtitle",
        "mbti",
        "contents",
        "like",
        [sequelize.col("username"), "username"],
        "updatedAt"
      ],
      order: [["createdAt", sort]],
      include: {
        model: Users,
        attributes: []
      },
      where: {
        mbti: queryRegion
      }
    });
  }

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
    currentUser: Number(userId),
    currentUsername: username.dataValues.username
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
    const newUser = await user_infos.save();
    return res.render("mypage", {
      currentUser: Number(userId),
      userInfo: newUser.dataValues
    });
  }
  const user = await User_infos.findOne({
    where: {
      userId: userId
    }
  });

  return res.render("mypage", {
    currentUser: Number(userId),
    userInfo: user.dataValues
  });
});

// 포스트 상세 페이지
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
      "mbti",
      "contents",
      "like",
      [sequelize.col("username"), "username"],
      "updatedAt"
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
  res.render("posts/post/", {
    currentUser: Number(userId),
    currentUsername: newPost.username,
    posts: newPost,
    comments: newComments,
    postLike: postLike ? postLike.dataValues.state : false
  });
});
// 포스트 수정
mainRouter.get("/posts/:postId/edit", [checkAuth, authMiddleware], async (req, res, next) => {
  const postId = req.params.postId;

  const post = await Posts.findOne({
    where: { postId },
    attributes: ["postId", "userId", "title", "subtitle", "mbti", "contents", "createdAt"]
  });
  const newPost = {
    ...post.dataValues
  };

  res.cookie("accessToken", res.locals.accessToken);
  res.render("posts/post/edit.ejs", {
    post: post.dataValues,
    currentUser: res.locals.currentUser,
    currentUsername: newPost.username
  });
});

// 댓글 수정 등록
mainRouter.get("/comments/:commentsId", [checkAuth, authMiddleware], async (req, res, next) => {
  const commentsId = req.params.commentsId;
  const comments = await Comments.findOne({
    where: { commentsId }
  });
  res.cookie("accessToken", res.locals.accessToken);
  res.render("comments/edit.ejs", {
    comments: comments.dataValues,
    currentUser: res.locals.currentUser
  });
});

// 포스트 좋아요
mainRouter.get("/posts/:postId/likes", [checkAuth, authMiddleware], async (req, res) => {
  const userId = res.locals.currentUser;
  const { postId } = req.params;

  const countLikes = await Likes.count({
    where: { userId, targetId: postId, target_type: "post" }
  });
  if (countLikes === 0) {
    const post = await Posts.findByPk(postId);
    const like = post.dataValues.like;
    await Likes.create({ userId, targetId: postId, target_type: "post", state: true });
    await Posts.update(
      {
        like: Number(like + 1)
      },
      { where: { postId } }
    );
    return res.redirect("back");
  } else {
    const post = await Posts.findByPk(postId);
    const like = post.dataValues.like;

    const checkLikes = await Likes.findOne({
      attributes: ["likeId", "state"],
      where: { userId, targetId: postId, target_type: "post" }
    });
    const likeState = checkLikes.dataValues.state;
    if (likeState) {
      await Posts.update(
        {
          like: like - 1
        },
        { where: { postId } }
      );
    } else {
      await Posts.update(
        {
          like: Number(like + 1)
        },
        { where: { postId } }
      );
    }

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
mainRouter.get("/logout", (req, res, next) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.redirect("/login");
});

module.exports = mainRouter;
