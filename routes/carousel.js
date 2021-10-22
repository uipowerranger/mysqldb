var express = require("express");
const CarouselController = require("../controllers/CarouselController");

var router = express.Router();

router.get("/", CarouselController.CauroselList);
router.post("/", CarouselController.CauroselStore);
router.put("/:id", CarouselController.CauroselUpdate);
router.delete("/:id", CarouselController.CauroselDelete);

module.exports = router;
