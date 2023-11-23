// import
const express = require("express");
const cookieParser = require("cookie-parser");
const postsRouter = require("./routes/posts.js");
require("dotenv").config();

// router import
const authorization = require("./middlewares/post-middleware.js")
// const { errorHandler } = require("./middlewares/error.handler.js");
const app = express();
const port = 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// router middleware
app.use("/api", postsRouter);


// router.get("/posts", authorization, async (req, res) => {

// })
app.get("/", async (req, res) => {
  const users = await users.findAll();
  console.log(users);
  res.send("Welcome");
});

// app.use((err, req, res, next) => {
//   errorHandler(err.message, req, res);
// });

app.listen(port, () => {
  console.log(port, " 서버가 열렸습니다. " + port);
});
