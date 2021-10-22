var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
require("dotenv").config();
var indexRouter = require("./routes/index");
var apiRouter = require("./routes/api");
var paymentRouter = require("./routes/payment");
var apiResponse = require("./helpers/apiResponse");
var cronJobs = require("./helpers/cronJobs");
var cors = require("cors");
require("./helpers/db_connect");

var app = express();

//don't show the log when it is test
if (process.env.NODE_ENV !== "test") {
  app.use(logger("dev"));
}
app.use(express.json({ limit: "2gb", extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: 1024 * 1024 * 20, type: "application/json" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: 1024 * 1024 * 20,
    type: "application/x-www-form-urlencoding",
  })
);
app.use(express.static(path.join(__dirname, "public")));

//To allow cross-origin requests
app.use(cors());

//start cron jobs
cronJobs.start();

// CORS middleware
app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);
  // Pass to next layer of middleware
  next();
});

//add file upload directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Route Prefixes
app.use("/", indexRouter);
app.use("/api/", apiRouter);
// app.use("/payment", paymentRouter);

// throw 404 if URL not found
app.all("*", function (req, res) {
  return apiResponse.notFoundResponse(res, "Page not found");
});

app.use((err, req, res, next) => {
  if (err.name == "UnauthorizedError") {
    return apiResponse.unauthorizedResponse(res, err.message);
  }
  next();
});

module.exports = app;
