// import
const express = require("express");
const cookieParser = require("cookie-parser");
const postsRouter = require("./routes/posts.js");
const authRouter = require("./routes/auth.js");
require("dotenv").config();

// router import

//const { errorHandler } = require("./middlewares/error.handler.js");
const app = express();
const port = 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// router middleware
app.use("/api", [postsRouter, authRouter]);
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
