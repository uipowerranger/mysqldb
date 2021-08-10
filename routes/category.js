var express = require("express");
const CategoryController = require("../controllers/CategoryController");

var router = express.Router();

router.get("/", CategoryController.CategoryList);
router.get("/bystate/:state", CategoryController.CategoryListByState);
router.post("/", CategoryController.CategoryStore);
router.put("/:id", CategoryController.CategoryUpdate);
router.delete("/:id", CategoryController.CategoryDelete);

module.exports = router;
