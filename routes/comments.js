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

//댓글 수정
router.put("/posts/:postId/comments/:commentsId", authMiddleware, async (req, res) => {
  let loginId = req.user.userId;
  const commentsId = req.params.commentsId;
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({
      success: false,
      message: "데이터형식이 올바르지 않습니다."
    });
  }
  const comment = await Comments.findOne({
    where: { commentsId }
  });

  const { userId } = comment;
  if (loginId !== userId) {
    return res.status(401).json({
      success: false,
      message: "댓글을 수정할 권한이 존재하지 않습니다."
    });
  }
  const updatedAt = new Date();

  Comments.update(
    {
      text,
      updatedAt
    },
    {
      where: { commentsId }
    }
  ).then(() => {
    return res.status(200).json({
      success: true,
      message: "댓글을 수정하였습니다."
    });
  });
});

//댓글 삭제
router.delete("/posts/:postId/comments/:commentsId", authMiddleware, async (req, res) => {
  let loginId = req.user.userId;
  const commentsId = req.params.commentsId;

  const comment = await Comments.findOne({
    where: { commentsId }
  });

  const { userId } = comment;
  if (loginId !== userId) {
    return res.status(401).json({
      success: false,
      message: "댓글을 삭제할 권한이 존재하지 않습니다."
    });
  }
  const updatedAt = new Date();

  Comments.destroy({
    where: { commentsId }
  }).then(() => {
    return res.status(200).json({
      success: true,
      message: "댓글을 삭제하였습니다."
    });
  });
});

module.exports = router;
