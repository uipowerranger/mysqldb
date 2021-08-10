var express = require("express");
const CitiesController = require("../controllers/CitiesController");

var router = express.Router();

router.get("/bystate/:id", CitiesController.CityListByState);
router.post("/", CitiesController.CityStore);
router.delete("/:id", CitiesController.CityDelete);

module.exports = router;
