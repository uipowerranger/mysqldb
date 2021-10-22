var express = require("express");
const UserController = require("../controllers/UserController");

var router = express.Router();

router.post("/", UserController.register);
router.post("/login", UserController.login);
router.put("/update/:id", UserController.UserUpdate);
router.get("/getbyid/:id", UserController.getUserById);
router.get("/", UserController.UsersList);
router.put("/update-password/:id", UserController.UserUpdatePassword);
router.post("/verify-otp", UserController.verifyConfirm);
router.post("/resend-verify-otp", UserController.resendConfirmOtp);
router.get("/homedata-by-state/:id", UserController.HomeData);
router.post("/reset-pwd-mail", UserController.resetMail);
router.post("/reset-pwd", UserController.resetPassword);

module.exports = router;
