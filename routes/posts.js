const express = require("express");
const router = express.Router();
const { Posts, Users, Comment } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware.js");
// const Comment = require("../models/comments");
const Post = require("../models/posts");

//여행지 등록
router.post("/posts", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  try {
    const { title, subtitle, region, contents } = req.body;
    if (!title || !subtitle || !region || !contents) {
      return res.status(400).json({
        success: false,
        message: "데이터형식이 올바르지 않습니다."
      });
    }
    const post = new Posts({
      userId,
      title,
      subtitle,
      region,
      contents,
      state: "true"
    });
    await post.save();
    return res.status(200).json({
      success: true,
      message: "관광지를 등록하였습니다."
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "관광지 등록에 실패하였습니다."
    });
  }
});

//관광지 수정
router.put("/posts/:postId", authMiddleware, async (req, res) => {
  let { userId } = res.locals.user;
  const userId2 = userId;
  try {
    const postId = req.params.postId;
    const { title, subtitle, region, contents } = req.body;
    if (!title || !subtitle || !region || !contents) {
      return res.status(400).json({
        success: false,
        message: "데이터형식이 올바르지 않습니다."
      });
    }
    const post = await Posts.findOne({
      where: { postId }
    });
    const { userId } = post;
    if (userId2 !== userId) {
      return res.status(401).json({
        success: false,
        message: "관광지 정보를 수정할 권한이 존재하지 않습니다."
      });
    }
    const updatedAt = new Date();

    Posts.update(
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
    ).then(() => {
      return res.status(200).json({
        success: true,
        message: "관광지 정보를 수정하였습니다."
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "서버 오류."
    });
  }
});

//관광지 삭제
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  let { userId } = res.locals.user;
  const userId2 = userId;
  try {
    const postId = req.params.postId;
    const post = await Posts.findAll({
      where: { postId }
    });
    if (!post) {
      return res.status(500).json({
        success: false,
        message: "관광지 조회에 실패 하였습니다."
      });
    }
    const { userId } = post;
    if (userId2 !== userId) {
      return res.status(401).json({
        success: false,
        message: "관광지를 삭제할 권한이 존재하지 않습니다."
      });
    }
    Posts.destroy({
      where: { postId }
    }).then(() => {
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
