// jwt모듈 가져오기
const jwt = require("jsonwebtoken");
// users 모델가져오기
const { Users } = require("../models");
// accessToken_Secret_key
require("dotenv").config();
const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;

// 사용자 인증 미들웨어
module.exports = async (req, res, next) => {
     //req.headers를 통한 authorization 전달받기
    const { authorization } = req.headers;
 
    // split를 통해 분리 기준은 " "으로한다.
    // 배열구조분해할당으로 authType, authToken으로 각각 할당한다.
    const [authType, authToken] = (authorization || "").split(" ");
    // authType이 Bearer가 아니거나 빈값일 때 예외처리
    if (!authToken || authType !== "Bearer") {
        res.status(401).send({
            success:false,
            errorMessage: "로그인 후 이용 가능한 기능입니다."
        });
        return;
    }

    // 서버를 꺼지는 것을 방지하기 위해 try catch 사용
    try {
    // 토큰 값 검증하는 과정. 복호화 및 검증
    const { userId } = jwt.verify(authToken, accessTokenSecretKey);
    // 인증 성공 시 res.locals.user에 인증 된 사용자 정보를 담는다.
    Users.findByPk(userId).then((user) => {
        res.locals.user = user;
        next();
    });
    }
    catch (err) {
        // 토큰 유효기간이 만료된 경우 예외처리
        if(err.name === "TokenExpiredError") {
            res.status(401).send({
                success: false,
                errorMessage: "토큰 유효기간이 만료되었습니다."  
            });
        }

        // 검증에 실패한 경우 예외처리
        res.status(401).send({
            success: false,
            errorMessage: "로그인 후 이용 가능한 기능입니다."
        });
    }
};