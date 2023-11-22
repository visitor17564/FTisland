// jwt모듈 가져오기
const jwt = require("jsonwebtoken");
// users 모델가져오기
const { Users, Refresh_tokens } = require("../models");
// Secret_key
require("dotenv").config();
const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET_KEY;

// 토큰 변수선언

// 사용자 인증 미들웨어
module.exports = async (req, res, next) => {
  // split를 통해 분리 기준은 " "으로한다.
  // 배열구조분해할당으로 각각 할당한다.
  const [accessAuthType, accessAuthToken] = (accessToken = req.cookies.authorization.accessToken.split(" "));
  const [refreshAuthType, refreshAuthToken] = (refreshToken = req.cookies.authorization.refreshToken.split(" "));

  // accessToken type이 Bearer가 아니거나 빈값일 때 예외처리
  if (!accessAuthToken || accessAuthType !== "Bearer") {
    res.status(401).send({
      success: false,
      errorMessage: "로그인 후 이용 가능한 기능입니다."
    });
    return;
  }

  // AccessToken을 검증하는 함수를 선언해둠
  const verifyAccessToken = async function (accessAuthToken) {
    try {
      return jwt.verify(accessAuthToken, accessTokenSecretKey);
    } catch (err) {
      return false;
    }
  };

  const verifiedAccessToken = verifyAccessToken(accessAuthToken);
  const accessTokenUserId = await verifiedAccessToken.then((res) => {
    return res.userId;
  });
  console.log("엑세스토큰 UserId : " + accessTokenUserId);

  // RefreshToken을 검증하는 함수를 선언해둠
  const verifyRefreshToken = async function (refreshAuthToken) {
    try {
      return jwt.verify(refreshAuthToken, refreshTokenSecretKey);
    } catch (err) {
      return false;
    }
  };

  const verifiedRefreshToken = verifyRefreshToken(refreshAuthToken);
  const refreshTokenUserId = await verifiedRefreshToken.then((res) => {
    return res.userId;
  });

  // AccessToken이 검증에 통과할 경우 RefreshToken이 있는지 확인
  // verifiedRefreshToken가 프로미스라 그냥 조건문에 넣으면 인증실패해도 falsy안됨
  if (accessTokenUserId) {
    // RefreshToken이 없을 경우 token을 생성, DB저장하고 DATA반환
    if (!refreshTokenUserId) {
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

  // AccessToken이 검증에 실패할 경우 RefreshToken이 있는지 확인
  // 일단 DB에서 RefreshToken을 조회
  const Refresh_tokens = await Refresh_tokens.findOne({ where: { token: refreshAuthToken } });

  if (Refresh_tokens) {
    // RefreshToken이 있을 경우 AccessToken을 생성, 데이터 반환
    const recreatedAccessToken = jwt.sign({ userId: refreshTokenUserId }, accessTokenSecretKey, { expiresIn: "1h" });
    const user = await Users.findOne({ where: { userId: refreshTokenUserId } });
    res.locals.user = user;
    res.clearCookie("authorization");
    res.cookie("authorization", {
      accessToken: `Bearer ${recreatedAccessToken}`,
      refreshToken: `Bearer ${refreshAuthToken}`
    });
    return;
    next();
  } else {
    return res.status(401).send({
      success: false,
      errorMessage: "로그인 후 이용 가능한 기능입니다."
    });
  }
};
