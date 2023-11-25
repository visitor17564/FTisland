// 모듈 가져오기
const express = require("express");

// router 가져오기
const router = express.Router();

// 모델 가져오기
const { Posts, Likes, sequelize } = require("../models/index.js");

// 미들웨어 가져오기
const { authMiddleware } = require("../middlewares/auth-middleware");

// 게시글
const target_type = "글";

// 내가 좋아하는 게시글 조회API(수정필요)
router.get("/user/my_liked_posts", authMiddleware, async (req, res) => {
  const { userId } = req.user;
  // user와 user_info의 id가 일치하는 것을 찾는다.
  const [result, metadata] = await sequelize.query(
    "SELECT `Posts`.`postId`, `Posts`.`title` FROM `Likes` LEFT JOIN `Posts` ON `Posts`.`postId` = `Likes`.`targetId` WHERE `Likes`.`target_type` = " +
      `"${target_type}"` +
      " AND `Likes`.`userId` = " +
      `${userId}` +
      " AND `Posts`.`postId` IS NOT NULL"
  );

  if (!result.length) {
    return res.status(404).send({
      success: false,
      errorMessage: "좋아하는 게시글이 없습니다."
    });
  }
  res.status(200).json({ success: true, data: result });
});

// 특정 글 좋아하는 사람 조회API
router.get("/posts/:postId/likes", async (req, res) => {
  const { postId } = req.params.postId;

  // user와 user_info의 id가 일치하는 것을 찾는다.
  const postLikers = await Likes.findAll({
    attributes: [[Sequelize.col("user.username"), "username"]],
    where: { targetId: postId, target_type },
    include: [{ model: Users, attributes: [] }]
  });

  if (!postLikers.length) {
    return res.status(404).send({
      success: false,
      errorMessage: "해당글을 좋아하는 사람이 없습니다."
    });
  }

  res.status(200).json({ success: true, data: postLikers });
});

// Like버튼 누르기
router.post("/posts/:postId/likes", authMiddleware, async (req, res) => {
  // 구조분해할당
  const { userId } = req.user;
  const { postId } = req.params;

  const checkLikes = await Likes.findOne({
    where: { userId, targetId: postId, target_type }
  });

  if (checkLikes) {
    return res.status(400).send({
      success: false,
      errorMessage: "이미 좋아하는중입니다."
    });
  }

  // 인증미들웨어만 통과하면 Likes 등록
  await Likes.create({ userId, targetId: postId, target_type });
  res.status(201).json({ success: true, Message: "Like 성공!" });
});

// Likes 취소버튼 누르기
router.delete("/posts/:postId/likes", authMiddleware, async (req, res) => {
  // 구조분해할당
  const { userId } = req.user;
  const { postId } = req.params;

  // 인증미들웨어만 통과하면 follow 등록
  await Likes.destroy({
    where: {
      userId,
      targetId: postId,
      target_type
    }
  });
  res.status(201).json({ success: true, Message: "Like 취소!" });
});

module.exports = router;
