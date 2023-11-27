const express = require("express");
const router = express.Router();
const { Posts, Comments } = require("../../models");
const { authMiddleware } = require("../middleware/auth.middleware");

//댓글 생성
router.post("/posts/:postId/comments", authMiddleware, async (req, res, next) => {
  const userId = res.locals.currentUser;
  const { text } = req.body;
  const { postId } = req.params;
  const post = await Posts.findByPk(postId);
  if (!post) {
    next(new Error("NotFoundPost"));
  }

  const addComments = await Comments.create({ text, userId, postId });
  if (!addComments) {
    next(new Error("AddCommentsError"));
  }
  res.redirect(`/posts/${post.postId}`);
});

//댓글 수정
router.post("/posts/:postId/comments/:commentsId", authMiddleware, async (req, res, next) => {
  const { commentsId, postId } = req.params;
  const { text } = req.body;
  await Comments.update(
    { text },
    {
      where: {
        commentsId
      }
    }
  );
  return res.redirect(`/posts/${postId}`);
});

// 삭제
router.post("/posts/:postId/comments/:commentsId/delete", authMiddleware, async (req, res, next) => {
  const { commentsId, postId } = req.params;
  Comments.destroy({
    where: { commentsId }
  }).then(() => {
    return res.redirect(`/posts/${postId}`);
  });
});

module.exports = router;
