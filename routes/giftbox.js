var express = require("express");
const GiftBoxController = require("../controllers/GiftBoxController");

var router = express.Router();

router.post("/create", GiftBoxController.create);
router.get("/", GiftBoxController.list);
router.delete("/:id", GiftBoxController.delete);
router.put("/:id", GiftBoxController.update);

module.exports = router;
