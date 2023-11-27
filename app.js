// import
const express = require("express");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const postsRouter = require("./routes/posts.js");
const authRouter = require("./routes/auth.js");
const mypageRouter = require("./routes/mypage.js");
const mainRouter = require("./routes/main.router.js");
const followRouter = require("./routes/follows.js");
const cookieSession = require("cookie-session");
require("./config/passport");
const commentRouter = require("./routes/comments.js");
const { errorHandler } = require("./middlewares/error-handler.js");
require("dotenv").config();

//const { errorHandler } = require("./middlewares/error.handler.js");
const path = require("path");
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const cookieEncryptionKey = process.env.COOKIE_ENCRYPTION_KEY;
app.use(
  cookieSession({
    name: "cookie-session-name",
    keys: [cookieEncryptionKey]
  })
);
// register regenerate & save after the cookieSession middleware initialization
app.use(function (request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb) => {
      cb();
    };
  }
  if (request.session && !request.session.save) {
    request.session.save = (cb) => {
      cb();
    };
  }
  next();
});

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.accessToken = req.cookies.accessToken;
  next();
});
require("./config/passport");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
const publicDirectoryPath = path.join(__dirname, "public");
app.use(express.static(publicDirectoryPath));

// router middleware
app.use("/api", [authRouter, mypageRouter, postsRouter, followRouter, commentRouter]);
app.use("/", mainRouter);

app.use((err, req, res, next) => {
  errorHandler(err.message, req, res);
});

app.listen(port, () => {
  console.log(port, " 서버가 열렸습니다. " + port);
});
