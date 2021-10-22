var express = require("express");
const WishlistController = require("../controllers/WishlistController");

var router = express.Router();

router.post("/create", WishlistController.create);
router.get("/", WishlistController.CheckoutList);
router.delete("/:id", WishlistController.delete);

module.exports = router;
