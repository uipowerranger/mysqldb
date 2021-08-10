var express = require("express");
const FiltersController = require("../controllers/FiltersController");

var router = express.Router();

router.post("/create", FiltersController.create);
router.get("/", FiltersController.list);
router.put("/:id", FiltersController.update);
router.delete("/:id", FiltersController.delete);

module.exports = router;
