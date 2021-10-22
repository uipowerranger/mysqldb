var express = require("express");
const StateController = require("../controllers/StateController");

var router = express.Router();

router.get("/", StateController.StateList);
router.get("/details/:id", StateController.StateListById);
router.post("/", StateController.StateStore);
router.put("/:id", StateController.StateUpdate);
router.delete("/:id", StateController.StateDelete);

module.exports = router;
