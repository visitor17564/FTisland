// import

const express = require("express");
const cookieParser = require("cookie-parser");

const postsRouter = require("./routers/post.js");
const authRouter = require("./routers/auth.js");
const myPageRouter = require("./routers/mypage.js");
const commentsRouter = require("./routers/comments.js");
const mainRouter = require("./routers/main.router.js");
const { errorHandler } = require("./middleware/error-handler.js");

require("dotenv").config();
const path = require("path");

//
const app = express();
const port = 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.accessToken = req.cookies.accessToken;
  next();
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
const publicDirectoryPath = path.join(__dirname, "public");
app.use(express.static(publicDirectoryPath));

// router middleware
app.use("/api", [authRouter, postsRouter, myPageRouter, commentsRouter]);
app.use("/", mainRouter);

app.use((err, req, res, next) => {
  errorHandler(err.message, req, res);
});

app.listen(port, () => {
  console.log(port, " 서버가 열렸습니다. " + port);
});
