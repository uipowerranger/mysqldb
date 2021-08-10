var express = require("express");
const StockController = require("../controllers/StockController");

var router = express.Router();

router.get("/byproduct/:id", StockController.Product);
router.get("/movement-byproduct/:id", StockController.MovementProduct);
router.get("/totalstocks", StockController.AllProducts);
router.get("/totalstocks-movement", StockController.AllProductsMovement);
router.post("/stock-adjustment", StockController.ProductStockAdj);

module.exports = router;
