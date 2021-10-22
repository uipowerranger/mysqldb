var express = require("express");
const OrderController = require("../controllers/OrderController");

var router = express.Router();

router.post("/create", OrderController.create);
router.get("/", OrderController.OrdersList);
router.get("/get-admin", OrderController.OrdersListAll);
router.post("/filter-by-date", OrderController.OrdersByDate);
router.post("/update-status", OrderController.OrderUpdateStatus);
router.post("/verify-token", OrderController.VerifyToken);

module.exports = router;
