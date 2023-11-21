// import
const express = require("express");
const cookieParser = require("cookie-parser");

// router import

const { errorHandler } = require("./middlewares/error.handler.js");
const app = express();
const port = 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());

// router middleware

app.get("/", (req, res) => {
  res.send("Welcome");
});

app.use((err, req, res, next) => {
  errorHandler(err.message, req, res);
});

app.listen(port, () => {
  console.log(port, "listening on port " + port);
});
