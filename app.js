// import
const express = require("express");
const cookieParser = require("cookie-parser");
const { Users } = require("./models");
// router import
const authRouter = require("./routes/auth.js");

//const { errorHandler } = require("./middlewares/error.handler.js");
const app = express();
const port = 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// router middleware
app.use("/api", [authRouter]);

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
