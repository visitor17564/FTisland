const express = require("express");
const router = express.Router();
const { Posts, Comments } = require("../models");
const { authMiddleware, checkAuth } = require("../middlewares/auth-middleware");

//댓글 생성
router.post("/posts/:postId/comments", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;
  const { userId } = req.user;
  try {
    const post = await Posts.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "포스트를 찾을 수 없습니다."
      });
    }

    await Comments.create({ text, userId, postId });
    res.status(201).json({
      success: true,
      message: "댓글이 등록되었습니다."
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
  const { postId } = req.params;
  const comments = await Comments.findAll({
    where: { postId }
  });

  if (!comments) {
    return res.status(404).json({
      success: false,
      message: "댓글을 조회할 수 없습니다."
    });
  }

  res.send(comments);
});

module.exports = router;
