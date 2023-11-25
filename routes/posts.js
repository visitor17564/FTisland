const express = require("express");
const router = express.Router();
const { Posts, Users, Comments } = require("../models");
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
router.put("/posts/:postId", authMiddleware, async (req, res) => {
  let { userId } = req.user;
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
  let { userId } = req.user;
  const userId2 = userId;
  try {
    const postId = req.params.postId;
    const post = await Posts.findOne({
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

module.exports = router;
