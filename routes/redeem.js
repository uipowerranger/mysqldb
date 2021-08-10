var express = require("express");
const RedeemController = require("../controllers/RedeemController");

var router = express.Router();

router.get("/", RedeemController.RedeemList);
router.get("/totalpoints", RedeemController.RedeemTotal);

module.exports = router;
