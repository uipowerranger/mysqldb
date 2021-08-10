var express = require("express");
const AdminController = require("../controllers/AdminController");

var router = express.Router();

router.post("/register", AdminController.register);
router.post("/login", AdminController.login);
router.put("/update/:id", AdminController.AdminUpdate);
router.get("/getbyid/:id", AdminController.getAdminById);
router.get("/", AdminController.AdminsList);
router.put("/update-password/:id", AdminController.AdminUpdatePassword);
router.post("/verify-otp", AdminController.verifyConfirm);
router.post("/resend-verify-otp", AdminController.resendConfirmOtp);
router.post("/fileUpload", AdminController.fileUpload);
router.post("/reset-pwd-mail", AdminController.resetMail);
router.post("/reset-pwd", AdminController.resetPassword);

module.exports = router;
