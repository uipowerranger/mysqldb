var express = require("express");
const ClientController = require("../controllers/ClientController");

var router = express.Router();

router.post("/validate-state-postcode", ClientController.validateStatePostcode);
router.post("/state-postcode-getcategory", ClientController.getCategory);
router.post("/subcategory-products", ClientController.subcategoryProducts);

module.exports = router;
