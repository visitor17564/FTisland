// jwt모듈 가져오기
const jwt = require("jsonwebtoken");

const { redis } = require("../config/config");
// users 모델가져오기
const { Users, Refresh_tokens } = require("../models");
// Secret_key
require("dotenv").config();
const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET_KEY;

// 사용자 인증 미들웨어
const authMiddleware = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.accessToken;
  res.clearCookie("accessToken");
  const verifiedAccessToken = jwt.verify(accessToken, accessTokenSecretKey, (err, user) => {
    if (err) throw next(err);
    console.log(user);

    next();
  });

  if (verifiedAccessToken) {
    res.locals.user = verifiedAccessToken;
    return next();
  }

  // const verifiedRefreshToken = verifyRefreshToken(refreshToken);
  // // 임시로
  // if (verifiedRefreshToken) {
  //   req.user = verifiedRefreshToken;
  //   return next();
  // }

  /*

  // RefreshToken은 DB에서도 뒤져둬야함
  const findDbRefreshToken = await Refresh_tokens.findOne({ where: { token: refreshAuthToken } });
  // AccessToken이 검증에 통과할 경우 RefreshToken이 있는지 확인
  // verifiedRefreshToken가 프로미스라 그냥 조건문에 넣으면 인증실패해도 falsy안됨
  if (accessTokenUserId && accessAuthType === "Bearer") {
    // RefreshToken이 없을 경우 token을 생성, DB저장하고 DATA반환
    if (!refreshTokenUserId || !findDbRefreshToken) {
      const recreatedRefreshToken = jwt.sign(
        // 엑세스토큰 userId를 담고 있는 Payload
        { userId: accessTokenUserId },
        refreshTokenSecretKey,
        // Token 유효기한 1시간 설정
        { expiresIn: "1d" }
      );
      await Refresh_tokens.create({ token: recreatedRefreshToken, userId: accessTokenUserId });
      const user = await Users.findOne({ where: { userId: accessTokenUserId } });
      res.locals.user = user;
      res.clearCookie("authorization");
      res.cookie("authorization", {
        accessToken: `Bearer ${accessAuthToken}`,
        refreshToken: `Bearer ${recreatedRefreshToken}`
      });
      next();
      return;
      // RefreshToken이 있을 경우 DATA반환
    } else {
      const user = await Users.findOne({ where: { userId: accessTokenUserId } });
      res.locals.user = user;
      next();
      return;
    }
  }
*/
  // AccessToken이 검증에 실패할 경우 RefreshToken이 있는지 확인
  if (accessToken && refreshToken) {
    // RefreshToken이 있을 경우 AccessToken을 생성, 데이터 반환
    const newAccessToken = jwt.sign({ userId: accessToken }, accessTokenSecretKey, { expiresIn: "1h" });

    const verifiedNewAccessToken = verifyRefreshToken(newAccessToken);
    res.user = verifiedNewAccessToken;

    res.cookie("accessToken", newAccessToken);

    next();
  } else {
    return res.status(401).send({
      success: false,
      errorMessage: "로그인 후 이용 가능한 기능입니다."
    });
  }
};
// 로그인 상태 확인 검증값으로 바꿔야됨
const checkAuth = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (accessToken && refreshToken) {
    next();
  } else {
    res.redirect("/login");
  }
};

// AccessToken을 검증하는 함수를 선언해둠
const verifyAccessToken = function (accessAuthToken) {
  try {
    return jwt.verify(accessAuthToken, accessTokenSecretKey);
  } catch (err) {
    return false;
  }
};

// RefreshToken을 검증하는 함수를 선언해둠
const verifyRefreshToken = async function (refreshAuthToken) {
  try {
    return jwt.verify(refreshAuthToken, refreshTokenSecretKey);
  } catch (err) {
    return false;
  }
};
module.exports = {
  authMiddleware,
  checkAuth
};
