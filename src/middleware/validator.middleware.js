const { validationResult } = require("express-validator");
// 로그인 검증
exports.validatorLogin = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.redirect("/login");
  }
  next();
};
