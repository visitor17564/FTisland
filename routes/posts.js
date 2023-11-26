const express = require("express");
const router = express.Router();
const { Posts } = require("../models");
const multer = require("multer");
const path = require("path");

const { authMiddleware, checkAuth } = require("../middlewares/auth-middleware");

const storageEngine = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, "../public/image"));
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  }
});
const upload = multer({ storage: storageEngine }).single("image");

//여행지 등록
router.post("/posts", [checkAuth, authMiddleware, upload], async (req, res) => {
  const { title, region, contents } = req.body;
  const image = req.file ? req.file.filename : "";
  console.log(title, region, contents, image);

  if (!title || !region || !contents) {
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
router.post("/posts/:postId", authMiddleware, async (req, res) => {
  const postId = req.params.postId;
  const { title, region, contents } = req.body;

  if (!title || !region || !contents) {
    return res.status(400).json({
      success: false,
      message: "데이터형식이 올바르지 않습니다."
    });
  }

  Posts.update(
    {
      title,
      region,
      contents
    },
    {
      where: { postId }
    }
  ).then(() => {
    return res.redirect(`/posts/${postId}`);
  });
});

//관광지 삭제
router.post("/posts/delete/:postId", authMiddleware, async (req, res, next) => {
  // 권한 미들 웨어 추가
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
