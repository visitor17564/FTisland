const express = require("express"); // express
const router = express.Router();

const { Users } = require("../models"); // Users모델 불러오기
const { User_infos } = require("../models"); // users_infos 가져오기
const authMiddleware = require("../middlewares/auth-middleware.js"); // 미들웨어연결
const bcrypt = require("bcrypt"); // bcrypt 비밀번호 hash 라이브러리
const saltRounds = 10; // bcrypt 비밀번호 hash 라이브러리, 확인을 위한 함수선언
const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.log(error);
  }
  return false;
};

// 사용자 정보 조회 API
// UserInfo랑 엮어서 보여줘야함(후에)
router.get("/my_page", authMiddleware, async (req, res) => {
  try {
    // 사용자정보 보여주기
    return res.status(200).json({ success: true, data: res.locals.user });
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
//     const hashedPassword = await bcrypt.hash(password, saltRounds);
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
