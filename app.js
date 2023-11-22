// import
const express = require("express");
const cookieParser = require("cookie-parser");
const postsRouter = require("./routes/posts.js");
require("dotenv").config();

// router import

const { errorHandler } = require("./middlewares/error.handler.js");
const app = express();
const port = 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// router middleware
app.use("/api", postsRouter);

app.get("/", async (req, res) => {
  const a = await Users.findAll();
  console.log(a);
  res.send("Welcome");
});

// app.use((err, req, res, next) => {
//   errorHandler(err.message, req, res);
// });

app.listen(port, () => {
  console.log(port, "listening on port " + port);
});
