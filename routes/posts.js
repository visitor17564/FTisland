const express = require("express");
const router = express.Router();
const { Posts, Users, Comment } = require("../models");
// const Comment = require("../models/comments");
const Post = require("../models/posts");
const { authMiddleware, checkAuth } = require("../middlewares/auth-middleware");

//여행지 등록
router.post("/posts", [checkAuth, authMiddleware], async (req, res) => {
  const { title, region, contents } = req.body;
  if (!title || !region || !contents) {
    return res.status(400).json({
      success: false,
      message: "데이터형식이 올바르지 않습니다."
    });
  }
  const userId = req.user.userId;
  console.log(userId);
  const post = new Posts({
    userId,
    title,
    region,
    contents,
    state: "true"
  });
  const temp = await post.save();
  if (!temp) {
    next(new Error("postRegisterError"));
  }
  res.redirect("/posts");
});

//관광지 수정
router.put("/posts/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const { title, subtitle, region, contents } = req.body;
    if (!title || !subtitle || !region || !contents) {
      return res.status(400).json({
        success: false,
        message: "데이터형식이 올바르지 않습니다."
      });
    }
    const post = await Posts.findOne({ postId });

    if (!post.dataValues) {
      return res.status(401).json({
        success: false,
        message: "관광지 정보를 수정할 권한이 존재하지 않습니다."
      });
    }
    const updatedAt = new Date();

    post
      .update(
        {
          title,
          subtitle,
          region,
          contents,
          updatedAt
        },
        {
          where: { postId }
        }
      )
      .then(() => {
        return res.status(200).json({
          success: true,
          message: "관광지 정보를 수정하였습니다."
        });
      });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "서버 오류."
    });
  }
});

//관광지 삭제
router.delete("/posts/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Posts.findOne({ postId });

    if (!post.dataValues) {
      return res.status(500).json({
        success: false,
        message: "관광지 조회에 실패 하였습니다."
      });
    }
    // if (post.dataValues.postId !== res.locals.posts.dataValues.postId) {
    //     return res.status(401).json({
    //         success: false,
    //         message: "관광지를 삭제할 권한이 존재하지 않습니다."
    //     });
    // }
    post
      .destroy({
        where: { postId }
      })
      .then(() => {
        return res.status(200).json({
          success: false,
          message: "관광지 정보를 삭제하였습니다."
        });
      });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "서버오류."
    });
  }
});

//댓글 생성
router.post("/posts/:postId/comments", async (req, res) => {
  const postId = req.params.postId;
  const { content, userId } = req.body;
  try {
    const post = await Posts.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "포스트를 찾을 수 없습니다."
      });
    }
    const comment = await Comment.create({ content, userId, postId });
    res.status(201).json({
      success: true,
      message: "댓글이 등록되었습니다.",
      comment
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "서버 오류."
    });
  }
});

//댓글 조회
router.get("/posts/:postId/comments", async (req, res) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findByPk(postId, {
      include: { model: Comment }
    });
    if (!post) {
      return res.status(404).json({
        message: "포스트를 찾을 수 없습니다."
      });
    }
    res.status(200).json({ comment: post.comments });
  } catch (err) {
    res.status(500).json({
      message: "서버 오류."
    });
  }
});

module.exports = router;
