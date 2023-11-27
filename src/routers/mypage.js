// import
const express = require("express");

const { User_infos } = require("../../models");

const { authMiddleware } = require("../middleware/auth.middleware");
const router = express.Router();

// 사용자 정보 수정
router.post("/user/:userId", authMiddleware, async (req, res) => {
  const userId = res.locals.currentUser;
  const { region, nation, introduce, mbti, githubUrl, blogUrl } = req.body;
  const user = {
    userId,
    region,
    nation,
    introduce,
    mbti,
    githubUrl,
    blogUrl
  };
  await User_infos.update(user, {
    where: { userId }
  }).then(() => {
    return res.redirect("/posts");
  });
});

module.exports = router;
