// import
const express = require("express");
const bcrypt = require("bcrypt");
const { Users } = require("../models");
const { User_infos } = require("../models");
const { body } = require("express-validator");
const { validatorErrorCheck } = require("../middlewares/validatorErrorCheck-middleware");
const { authMiddleware } = require("../middlewares/auth-middleware");

// mypage.js - global variables
const router = express.Router();

// 사용자 정보 생성 API
router.post(
  "/user/:userId",
  [
    // 빈 입력란 여부 체크 및 앞뒤 공백 제거
    body("region").notEmpty().trim().withMessage("지역이 비어있습니다."),
    body("nation").notEmpty().trim().withMessage("국가가 비어있습니다.")
  ],
  validatorErrorCheck,
  authMiddleware,
  async (req, res) => {
    console.log("!!");
    const { userId } = req.user;
    const { region, nation } = req.body;

    const user = {
      region,
      nation
    };
    await User_infos.update(user, {
      where: { userId }
    }).then(() => {
      return res.redirect(`/user/${userId}`);
    });
  }
);

// 사용자 및 정보 삭제
router.delete("/user/me", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { confirmPassword } = req.body;

    // 로그인한 사용자를 기반으로 userId가 일치하는 사용자를 찾는다.
    const user = await Users.findOne({
      where: { userId: userId }
    });

    // 구조분해할당으로 user의 password를 가져온다.
    const { password } = user;

    // 사용자가 없는 경우
    if (!user) {
      res.status(404).send({
        success: false,
        errorMessage: "이미 존재하지 않는 사용자 입니다."
      });
    }

    // 비밀번호 비교
    const isValidPass = await bcrypt.compare(confirmPassword, password);
    // 비밀번호가 서로 일치하지 않는 경우
    if (!isValidPass) {
      return res.status(401).json({
        success: false,
        errorMessage: "비밀번호가 서로 일치하지 않습니다."
      });
    }

    // 사용자 및 사용자 정보 삭제
    await Users.destroy({
      where: { userId: userId }
    });

    await User_infos.destroy({
      where: { userId: userId }
    });

    res.status(204).json({
      success: true,
      message: "회원탈퇴가 완료되었습니다."
    });
  } catch (err) {
    res.status(500).json({ success: false, Message: "예기치 못한 오류가 발생하였습니다." });
    console.log(err);
  }
});

module.exports = router;
