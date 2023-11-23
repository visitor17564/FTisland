// 모듈 가져오기
const express = require("express");
const bcrypt = require("bcrypt");

// router 가져오기
const router = express.Router();

// 모델 가져오기
const { Users } = require("../models");
const { User_infos } = require("../models");

// 미들웨어 가져오기
const authMiddleware = require("../middlewares/auth-middleware.js");

// 비밀번호 비교 함수
const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.log(error);
  }
  return false;
};

// 사용자 정보 생성 API
router.post("/user/me", authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { profile, region, nation, follow } = req.body;

    // 빈 입력란 여부 체크
    if (!profile || !region || !nation || !follow) {
      return res.status(401).send({
        success: false,
        errorMessage: "입력란 중 비어있는 곳이 있습니다."
      });
    }

    // 로그인한 사용자를 기반으로 userId가 일치하는 사용자의 정보를 찾는다.
    const user_info = await User_infos.findOne({
      where: {userId : userId }
    });

    // 사용자 정보가 존재하지 않으면 새로운 사용자 정보를 생성한다.
    if (!user_info) {
      await User_infos.create({
        profile: profile,
        region: region,
        nation: nation,
        follow: follow
      })
    };

    res.status(200).json({
      success: true,
      message: "프로필 생성이 완료되었습니다.",
      data : user_info
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      errorMessage: "예기치 못한 오류가 발생하였습니다."
    });
    console.log(err);
  }
})

// 사용자 정보 조회 API
router.get("/user/me", authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    
    // user와 user_info의 id가 일치하는 것을 찾는다.
    const user = await Users.findOne({
        where: { userId : userId },
        // user모델에서 password 부분을 제외한다.
        attributes: { exclude: ["password"] },
        // user_infos모델의 프로필, 지역, 국가, 팔로우를 선택하고 포함한다.
        include: [{ model: User_infos, attributes: ["profile", "region", "nation", "follow"] }],
    });

    // 사용자가 없는 경우
    if (!user) {
      res.status(404).send({
        success: false,
        errorMessage: "사용자 조회에 실패하였습니다." 
      })
    };
    
    // 사용자 정보 보여주기
    return res.status(200).json({
      success: true,
      data: user });
      
  } catch (err) {
    res.status(500).json({
      success: false,
      errorMessage: "예기치 못한 오류가 발생하였습니다."
    });
    console.log(err);
  }
});

// 사용자 정보 수정 API
router.put("/user/me", authMiddleware, async (req, res) => {
  try {
    const { userId, password } = res.locals.user;
    const { profile, region, nation, follow, confirmPassword } = req.body;

    // 로그인한 사용자를 기반으로 userId가 일치하는 사용자의 정보를 찾는다.
    const user_info = await User_infos.findOne({
      where: {userId : userId }
    });

    // 사용자 정보가 존재하지 않는 경우
    if (!user_info) {
      res.status(404).send({
        success: false,
        errorMessage: "사용자 정보가 존재하지 않습니다."
      })
    }

    // 비밀번호 비교
    const hash = password;
    const isValidPass = await comparePassword(confirmPassword, hash);
    // 비밀번호가 서로 일치하지 않는 경우
    if (!isValidPass) {
      return res.status(401).json({
        success: false,
        errorMessage: "비밀번호가 서로 일치하지 않습니다."
      });
    }

    // 비밀번호가 일치할 경우 사용자 정보 수정
    await User_infos.update(
      { profile, region, nation, follow },
      { where: { userId: userId }}
    );
    
    res.status(200).json({
      success: true,
      message: "사용자 정보 수정이 완료되었습니다."
    })

  } catch (err) {
    res.status(500).json({ success: false, message: "예기치 못한 오류가 발생하였습니다." });
    console.log(err);
  }
});

// 사용자 정보 삭제
router.delete("/user/me", authMiddleware, async (req, res) => {
  try {
    const { userId, password } = res.locals.user;
    const { confirmPassword } = req.body;

    // 로그인한 사용자를 기반으로 userId가 일치하는 사용자를 찾는다.
    const user = await Users.findOne({
      where: { userId : userId }
    });

    // 사용자가 없는 경우
    if (!user) {
      res.status(404).send({
        success: false,
        errorMessage: "이미 존재하지 않는 사용자 입니다." 
      })
    };

    // 비밀번호 비교
    const hash = password;
    const isValidPass = await comparePassword(confirmPassword, hash);
    // 비밀번호가 서로 일치하지 않는 경우
    if (!isValidPass) {
    return res.status(401).json({
      success: false,
      errorMessage: "비밀번호가 서로 일치하지 않습니다."
      });
    }

    // 사용자 및 사용자 정보 삭제
    await Users.destroy({
      where: { userId : userId }
    })

    await User_infos.destroy({
      where: { userId : userId }
    })

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
