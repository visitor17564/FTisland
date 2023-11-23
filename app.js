// import
const express = require("express");
const cookieParser = require("cookie-parser");
const { Users } = require("./models");
// router import
const authRouter = require("./routes/auth.js");
const mypageRouter = require("./routes/mypage.js");

const path = require("path");
const mainRouter = require("./routes/main.router.js");

//const { errorHandler } = require("./middlewares/error.handler.js");
const app = express();
const port = 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
const publicDirectoryPath = path.join(__dirname, "public");
app.use(express.static(publicDirectoryPath));
const temp = ["서울", "경기", "인천", "강원"];
// router middleware
app.use("/", mainRouter);
app.use("/api", [authRouter, mypageRouter]);

app.get("/", async (req, res) => {
  res.render("posts", {
    regions: temp,
    posts: temp
  });
});

// app.use((err, req, res, next) => {
//   errorHandler(err.message, req, res);
// });

app.listen(port, () => {
  console.log(port, "listening on port " + port);
});
