var express = require("express");
const UnitController = require("../controllers/UnitController");

var router = express.Router();

router.get("/", UnitController.UnitList);
router.post("/", UnitController.UnitStore);
router.put("/:id", UnitController.UnitUpdate);
router.delete("/:id", UnitController.UnitDelete);

module.exports = router;
