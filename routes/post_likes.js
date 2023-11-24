// 모듈 가져오기
const express = require("express");

// router 가져오기
const router = express.Router();

// 모델 가져오기
const { Posts, Likes } = require("../models/index.js");

// 미들웨어 가져오기
const { authMiddleware } = require("../middlewares/auth-middleware");

// 게시글
const target_type = 2;

// 내가 좋아하는 게시글 조회API(수정필요)
router.get("/user/my_liked_posts", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  // user와 user_info의 id가 일치하는 것을 찾는다.
  const myLikedTargetId = await Likes.findAll({
    attributes: ["targetId"],
    where: { userId, target_type },
    include: [
      {
        model: Posts,
        where: { postId: targetId }
      }
    ]
  });

  if (!myLikedTargetId.length) {
    return res.status(404).send({
      success: false,
      errorMessage: "좋아하는 게시글이 없습니다."
    });
  }
  res.status(200).json({ success: true, data: followers });
});

// 특정 글 좋아하는 사람 조회API
router.get("/posts/likes", async (req, res) => {
  const { postId } = res.locals.user;

  // user와 user_info의 id가 일치하는 것을 찾는다.
  const postLiker = await Likes.findAll({
    attributes: ["userId"],
    where: { targetId: postId, target_type },
    include: [{ model: Users, attributes: ["username"] }]
  });

  if (!postLiker.length) {
    return res.status(404).send({
      success: false,
      errorMessage: "해달글을 좋아하는 사람이 없습니다."
    });
  }

  res.status(200).json({ success: true, data: postLiker });
});

// Like버튼 누르기
router.post("/posts/likes", authMiddleware, async (req, res) => {
  // 구조분해할당
  const { userId } = res.locals.user;
  const { targetId } = req.body;

  const checkLikes = await Likes.findAll({
    where: { targetId, userId, target_type }
  });

  if (checkLikes.length) {
    return res.status(400).send({
      success: false,
      errorMessage: "이미 팔로우중입니다."
    });
  }

  // 인증미들웨어만 통과하면 follow 등록
  await Likes.create({ userId, targetId, target_type });
  res.status(201).json({ success: true, Message: "Like 성공!" });
});

// follow 취소버튼 누르기
router.delete("/posts/likes", authMiddleware, async (req, res) => {
  // 구조분해할당
  const { userId } = res.locals.user;
  const { targetId } = req.body;

  // 인증미들웨어만 통과하면 follow 등록
  await Likes.destroy({
    where: {
      userId,
      targetId,
      target_type
    }
  });
  res.status(201).json({ success: true, Message: "Follow 취소!" });
});

module.exports = router;
