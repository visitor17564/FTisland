const express = require("express");
const { Posts } = require("../../models");
const multer = require("multer");
const path = require("path");
const { authMiddleware, checkAuth } = require("../middleware/auth.middleware");
const router = express.Router();
// multer 세팅

const storageEngine = multer.diskStorage({
  destination: (req, file, callback) => {
    const uploadPath = path.join(__dirname, `../public/images`);
    callback(null, uploadPath);
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  }
});
const upload = multer({ storage: storageEngine }).single("image");

// 포스트 등록
router.post("/posts", [checkAuth, authMiddleware, upload], async (req, res) => {
  const { title, mbti, contents } = req.body;

  const image = req.file ? req.file.filename : "";

  if (!title || !mbti || !contents) {
    return res.status(400).json({
      success: false,
      message: "데이터형식이 올바르지 않습니다."
    });
  }

  const userId = res.locals.currentUser;
  const post = new Posts({
    userId,
    subtitle: image,
    title,
    mbti,
    contents,
    state: "true"
  });

  const postSave = await post.save();
  if (!postSave) {
    next(new Error("postRegisterError"));
  }

  res.redirect("/posts");
});

//포스트 수정
router.post("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { title, mbti, contents } = req.body;
  await Posts.update(
    {
      title,
      mbti,
      contents
    },
    {
      where: {
        postId
      }
    }
  );

  return res.redirect(`/posts/${postId}`);
});

//포스트 삭제
router.post("/posts/delete/:postId", authMiddleware, async (req, res, next) => {
  const postId = req.params.postId;
  const post = await Posts.findOne({
    where: { postId }
  });
  if (!post) {
    next(new Error("NotFoundPost"));
  }
  Posts.destroy({
    where: { postId }
  }).then(() => {
    return res.redirect("/posts");
  });
});

module.exports = router;
