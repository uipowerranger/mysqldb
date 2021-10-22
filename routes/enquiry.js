var express = require("express");
const EnquiryController = require("../controllers/EnquiryController");

var router = express.Router();

router.post("/create", EnquiryController.create);
router.get("/", EnquiryController.EnquiryList);

module.exports = router;
