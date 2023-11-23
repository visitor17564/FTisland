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


// 사용자 정보 조회 API
router.get("/my_page", authMiddleware, async (req, res) => {
  try {
    // 테스트용 userInfo
    const testUserInfo = {
      userId: res.locals.user.userId,
      profile: "프로필테스트",
      region: "지역테스트",
      nation: "국가테스트",
      follow: "팔로우테스트"
    };
    // 모델에 테스트용 정보 추가
    // create로 생성하고 모델에 추가를 했더니 아래와 같은 에러 발생
    // Duplicate entry '3' for key 'User_infos.PRIMARY
    // 기존에 userId 3이라는 값이 존재하여 upsert를 이용하여 update하여 문제해결
    await User_infos.upsert(testUserInfo, { where: { userId: res.locals.user.userId } });

    // user와 user_info의 id가 일치하는 것을 찾는다.
    const user = await Users.findOne({
        where: { userId : res.locals.user.userId },
        // user모델에서 password 부분을 제외한다.
        attributes: { exclude: ["password"] },
        // user_infos모델의 프로필, 지역, 국가, 팔로우를 선택하고 포함한다.
        include: [{ model: User_infos, attributes: ["profile", "region", "nation", "follow"] }],
    })

    // 유저가 없는 경우
    if (!user) {
      res.status(404).send({
        success: false,
        errorMessage: "회원 조회에 실패하였습니다." 
      })
    }
    
    // 사용자 정보 보여주기
    return res.status(200).json({
      success: true,
      data: user });
  } catch (err) {
    res.status(500).json({ success: false, Message: "예기치 못한 오류가 발생하였습니다." });
    console.log(err);
  }
});

// router.put("/my_page", authMiddleware, async (req, res) => {
//   try {
//     // 구조분해할당
//     const { userId } = res.locals.user;
//     const { googleId, kakaoId, profile, username, region, nation, password, confirmPassword } = req.body;

//     // 일단 상품 조회
//     const user = await Users.findOne({
//       where: {
//         userId: userId
//       }
//     });

//     // 유저가 없을 경우
//     if (!user) {
//       // userId로 뒤져서 나온 데이터가 false면 truthy되어 호출
//       return res.status(404).json({
//         success: false,
//         errorMessage: "회원 조회에 실패하였습니다."
//       });
//     }

//     // 로그인한 id값이 수정대상 상품 작성자와 다를 경우
//     if (user.userId !== id) {
//       return res.status(403).json({
//         success: false,
//         errorMessage: "수정 권한이 없습니다."
//       });
//     }

//     // 비밀번호가 비밀번호확인과 불일치
//     if (password !== confirmPassword) {
//       return res.status(400).json({
//         success: false,
//         errorMessage: "수정할 비밀번호가 비밀번호확인과 불일치합니다."
//       });
//     }

//     // 유효성검사 통과시 비밀번호 hash 및 기본정보 수정
//     const hashedPassword = await bcrypt.hash(password, 10);
//     await Users.update(
//       { password: hashedPassword },
//       {
//         where: {
//           userId: userId
//         }
//       }
//     );

//     // 유효성검사 통과시 유저 추가정보 수정
//     await User_infos.update(
//       { profile, username, region, nation },
//       {
//         where: {
//           userId: userId
//         }
//       }
//     );

//     res.status(204).json({ success: true, message: "회원 정보를 수정하였습니다." });
//   } catch (err) {
//     res.status(500).json({ success: false, Message: "예기치 못한 오류가 발생하였습니다." });
//     console.log(err);
//   }
// });

// router.delete("/my_page", authMiddleware, async (req, res) => {
//   try {
//     // 구조분해할당
//     const { id } = res.locals.user;
//     const { password } = req.body;

//     // 일단 상품 조회
//     const user = await Users.findOne({
//       where: {
//         userId: userId
//       }
//     });

//     // 유저가 없을 경우
//     if (!user) {
//       // userId로 뒤져서 나온 데이터가 false면 truthy되어 호출
//       return res.status(404).json({
//         success: false,
//         errorMessage: "회원 조회에 실패하였습니다."
//       });
//     }

//     // 로그인한 id값이 수정대상 상품 작성자와 다를 경우
//     if (user.userId !== id) {
//       return res.status(403).json({
//         success: false,
//         errorMessage: "권한이 없습니다."
//       });
//     }

//     // 비밀번호가 일치하지 않을 때
//     // 비밀번호 hash 및 비교
//     const hash = user.password;
//     const isValidPass = await comparePassword(password, hash);
//     if (!isValidPass) {
//       return res.status(401).json({ success: false, message: "비밀번호가 일치하지 않습니다." });
//     }

//     // 유효성 검사 통과시 상품삭제
//     await Users.destroy({
//       where: {
//         userId: userId
//       }
//     });
//     res.status(204).json({ success: true, message: "회원탈퇴가 완료되었습니다." });
//   } catch (err) {
//     res.status(500).json({ success: false, Message: "예기치 못한 오류가 발생하였습니다." });
//     console.log(err);
//   }
// });

module.exports = router;
