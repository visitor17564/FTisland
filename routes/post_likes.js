// 모듈 가져오기
const express = require("express");

// router 가져오기
const router = express.Router();

// 모델 가져오기
const { Users, Likes } = require("../models/index.js");

// 미들웨어 가져오기
const authMiddleware = require("../middlewares/auth-middleware.js");

// 게시글

// 내가 좋아하는 게시글 조회API
router.get("/user/my_follows", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  // user와 user_info의 id가 일치하는 것을 찾는다.
  const followers = await Follows.findAll({
    attributes: ["targetId"],
    where: { userId: userId },
    include: [{ model: Users, attributes: ["username"] }]
  });

  if (!followers.length) {
    return res.status(404).send({
      success: false,
      errorMessage: "팔로우하는 사람이 없습니다."
    });
  }
  res.status(200).json({ success: true, data: followers });
});

// 나를 팔로우하는 사람 조회API
router.get("/user/my_followers", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;

  // user와 user_info의 id가 일치하는 것을 찾는다.
  const followers = await Follows.findAll({
    attributes: ["userId"],
    where: { targetId: userId },
    include: [{ model: Users, attributes: ["username"] }]
  });

  if (!followers.length) {
    return res.status(404).send({
      success: false,
      errorMessage: "팔로워가 없습니다."
    });
  }

  res.status(200).json({ success: true, data: followers });
});

// follow버튼 누르기
router.post("/user/my_follows", authMiddleware, async (req, res) => {
  // 구조분해할당
  const { userId } = res.locals.user;
  const { targetId } = req.body;

  const checkFollows = await Follows.findAll({
    where: { targetId, userId }
  });

  if (checkFollows.length) {
    return res.status(400).send({
      success: false,
      errorMessage: "이미 팔로우중입니다."
    });
  }

  // 인증미들웨어만 통과하면 follow 등록
  await Follows.create({ userId, targetId });
  res.status(201).json({ success: true, Message: "Follow 성공!" });
});

// follow 취소버튼 누르기
router.delete("/user/my_follows", authMiddleware, async (req, res) => {
  // 구조분해할당
  const { userId } = res.locals.user;
  const { targetId } = req.body;

  // 인증미들웨어만 통과하면 follow 등록
  await Follows.destroy({
    where: {
      userId,
      targetId
    }
  });
  res.status(201).json({ success: true, Message: "Follow 취소!" });
});

module.exports = router;
