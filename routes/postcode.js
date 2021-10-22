var express = require("express");
const PostCodeController = require("../controllers/PostCodeController");

var router = express.Router();

router.get("/", PostCodeController.PostcodeList);
router.get("/bystate/:id", PostCodeController.PostcodeListById);
router.post("/", PostCodeController.PostcodeStore);
router.put("/:id", PostCodeController.PostcodeUpdate);
router.delete("/:id", PostCodeController.PostcodeDelete);

module.exports = router;
