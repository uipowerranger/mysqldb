var express = require("express");
const ProductController = require("../controllers/ProductController");

var router = express.Router();

router.get("/", ProductController.ProductList);
router.get("/bystate/:id", ProductController.ProductListByState);
router.post("/search/bystate", ProductController.ProductListSearchByState);
router.post(
  "/bystate/bycategory",
  ProductController.ProductListSearchByStateandCategory
);
router.post("/", ProductController.ProductStore);
router.put("/:id", ProductController.ProductUpdate);
router.delete("/:id/:status", ProductController.ProductDelete);
router.get("/allproducts", ProductController.AllProductList);
router.get("/bycategory/:id", ProductController.ProductListByCategory);
router.get("/bysubcategory/:id", ProductController.ProductListBySubCategory);

module.exports = router;
