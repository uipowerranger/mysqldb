const { body, validationResult } = require("express-validator");
const {
  adminList,
  login,
  updateOtp,
  register,
  verifyOtp,
  adminGetByEmail,
  resetConfirm,
  getAdminById,
  updatePassword,
  updateAdmin,
} = require("../services/AdminServices");
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/jwt");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");

/**
 * User registration.
 *
 * @param {string}      first_name
 * @param {string}      last_name
 * @param {string}      email_id
 * @param {string}      password
 *
 * @returns {Object}
 */

exports.register = [
  // Validate fields.
  body("first_name")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("last_name")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Last name must be specified.")
    .isAlphanumeric()
    .withMessage("Last name has non-alphanumeric characters."),
  body("email_id")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address."),
  body("phone_number")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Phone must be specified."),
  body("password")
    .isLength({ min: 6 })
    .trim()
    .escape()
    .withMessage("Password must be 6 characters or greater."),
  // Process request after validation and sanitization.
  async (req, res) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Display sanitized values/errors messages.
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        const { password } = req.body;
        let hash = await bcrypt.hash(password, 10);
        let otp = utility.randomNumber(6);
        let reg = await register({
          ...req.body,
          password: hash,
          confirmOTP: otp,
        });
        if (reg.status === 200) {
          return apiResponse.successResponse(res, reg.message);
        } else {
          return apiResponse.ErrorResponse(res, reg.message);
        }
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * User Update
 */
exports.AdminUpdate = [
  auth,
  body("first_name", "First Name must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("phone_number")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Phone must be specified."),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      const { id, ...rest } = req.body;
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        let data = await updateAdmin({ ...req.body, id: req.params.id });
        if (data.status === 200) {
          let userData = {
            id: data.admin_data.id,
            first_name: data.admin_data.first_name,
            last_name: data.admin_data.last_name,
            email_id: data.admin_data.email_id,
            role: data.admin_data.role,
            assign_state: data.admin_data.assign_state,
            image: data.admin_data.image,
          };
          //Prepare JWT token for authentication
          const jwtPayload = userData;
          const jwtData = {
            expiresIn: process.env.JWT_TIMEOUT_DURATION,
          };
          const secret = process.env.JWT_SECRET;
          //Generated JWT token with Payload and secret.
          userData.token = jwt.sign(jwtPayload, secret, jwtData);
          return apiResponse.successResponseWithData(
            res,
            data.message,
            userData
          );
        } else {
          return apiResponse.ErrorResponse(res, data.message);
        }
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Admin Update Password
 */

exports.AdminUpdatePassword = [
  auth,
  body("old_password", "Old password must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("new_password")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("New password must be specified."),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        let foundAdmin = await getAdminById(req.params.id);
        if (foundAdmin.length === 0) {
          return apiResponse.notFoundResponse(
            res,
            "Admin not exists with this id"
          );
        } else {
          //update admin.
          bcrypt.compare(
            req.body.old_password,
            foundAdmin[0].password,
            async function (err, same) {
              if (same) {
                let hash = await bcrypt.hash(req.body.new_password, 10);
                let rr = await updatePassword({
                  password: hash,
                  id: foundAdmin[0].id,
                });
                if (rr) {
                  return apiResponse.successResponse(res, "Password Updated");
                } else {
                  return apiResponse.ErrorResponse(
                    res,
                    "Error in update password"
                  );
                }
              } else {
                return apiResponse.ErrorResponse(
                  res,
                  "Old Password is invalid."
                );
              }
            }
          );
        }
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * User login.
 *
 * @param {string}      email_id
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.login = [
  body("email_id")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address."),
  body("password")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Password must be specified."),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        let response = await login(req.body.email_id);
        let user = response[0];
        if (user) {
          //Compare given password with db's hash.
          bcrypt.compare(
            req.body.password,
            user.password,
            function (err, same) {
              if (same) {
                //Check account confirmation.
                if (user.isConfirmed === 1) {
                  // Check User's account active or not.
                  if (user.status === 1) {
                    let otp = utility.randomNumber(6);
                    // Html email body
                    let html =
                      "<p>Please Login your Account.</p><p>OTP: " +
                      otp +
                      "</p>";
                    // Send confirmation email
                    mailer
                      .send(
                        constants.confirmEmails.from,
                        req.body.email_id,
                        "Login OTP ",
                        html
                      )
                      .then(async function () {
                        let resUpdateOtp = await updateOtp({
                          otp,
                          id: user.id,
                        });
                        let userData = {
                          id: user.id,
                          first_name: user.first_name,
                          last_name: user.last_name,
                          email_id: user.email_id,
                          role: user.role,
                          assign_state: user.assign_state,
                          image: user.image,
                        };
                        //Prepare JWT token for authentication
                        const jwtPayload = userData;
                        const jwtData = {
                          expiresIn: process.env.JWT_TIMEOUT_DURATION,
                        };
                        const secret = process.env.JWT_SECRET;
                        //Generated JWT token with Payload and secret.
                        userData.token = jwt.sign(jwtPayload, secret, jwtData);
                        return apiResponse.successResponseWithData(
                          res,
                          "Login Success.",
                          userData
                        );
                      });
                  } else {
                    return apiResponse.unauthorizedResponse(
                      res,
                      "Account is not active. Please contact admin."
                    );
                  }
                } else {
                  return apiResponse.unauthorizedResponse(
                    res,
                    "Your E-Mail is not confirmed."
                  );
                }
              } else {
                return apiResponse.unauthorizedResponse(
                  res,
                  "Email or Password wrong."
                );
              }
            }
          );
        } else {
          return apiResponse.unauthorizedResponse(
            res,
            "Email or Password wrong."
          );
        }
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Verify Confirm otp.
 *
 * @param {string}      email_id
 * @param {string}      otp
 *
 * @returns {Object}
 */
exports.verifyConfirm = [
  body("email_id")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address."),
  body("otp")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("OTP must be specified."),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        let resp = await verifyOtp(req.body);
        if (resp.length > 0) {
          let user = resp[0];
          let otp = utility.randomNumber(6);
          await updateOtp({
            otp,
            id: user.id,
          });
          let userData = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email_id: user.email_id,
            role: user.role,
            assign_state: user.assign_state,
            image: user.image,
          };
          //Prepare JWT token for authentication
          const jwtPayload = userData;
          const jwtData = {
            expiresIn: process.env.JWT_TIMEOUT_DURATION,
          };
          const secret = process.env.JWT_SECRET;
          //Generated JWT token with Payload and secret.
          userData.token = jwt.sign(jwtPayload, secret, jwtData);
          return apiResponse.successResponseWithData(
            res,
            "Login Success.",
            userData
          );
        } else {
          return apiResponse.ErrorResponse(res, "Invalid OTP");
        }
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Resend Confirm otp.
 *
 * @param {string}      email_id
 *
 * @returns {Object}
 */
exports.resendConfirmOtp = [
  body("email_id")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address."),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        var query = { email_id: req.body.email_id };
        let resp = await adminGetByEmail(query);
        let user = resp[0];
        if (user) {
          //Check already confirm or not.
          if (user.isConfirmed === 0) {
            // Generate otp
            let otp = utility.randomNumber(6);
            // Html email body
            let html =
              "<p>Please Login your Account.</p><p>OTP: " + otp + "</p>";
            // Send confirmation email
            mailer
              .send(
                constants.confirmEmails.from,
                req.body.email_id,
                "Login OTP",
                html
              )
              .then(async function () {
                let r = await resetConfirm({
                  otp,
                  email_id: req.body.email_id,
                  isConfirmed: 0,
                });
                if (!r) {
                  return apiResponse.ErrorResponse(res, "Otp sent error");
                }
                return apiResponse.successResponse(res, "Confirm otp sent.");
              });
          } else {
            return apiResponse.unauthorizedResponse(
              res,
              "Account already confirmed."
            );
          }
        } else {
          return apiResponse.unauthorizedResponse(
            res,
            "Specified email not found."
          );
        }
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Get Admin By id
 */

exports.getAdminById = [
  auth,
  async function (req, res) {
    try {
      let response = await getAdminById(req.params.id);
      return apiResponse.successResponseWithData(res, "Success", response);
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Get Admins
 */
exports.AdminsList = [
  auth,
  async function (req, res) {
    try {
      let response = await adminList();
      return apiResponse.successResponseWithData(res, "Success", response);
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Image uploads
 */
exports.fileUpload = [
  auth,
  async function (req, res) {
    try {
      const data = req.body.data;
      let url = await utility.saveImage(data);
      return apiResponse.successResponseWithData(res, "File uploaded", url);
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.resetMail = [
  body("email_id")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address."),
  async function (req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        let user = await adminGetByEmail({ email_id: req.body.email_id });
        let data = user[0];
        if (data) {
          let otp = utility.randomNumber(6);
          let url =
            process.env.PAYMENT_URL +
            `/#/admin/reset-pwd?email=${data.email_id}&otp=${otp}`;
          // Html email body
          let html = `<p>Reset Password.</p><p>Your OTP to reset password: ${otp}</p>`;
          // Send confirmation email
          mailer
            .send(
              constants.confirmEmails.from,
              req.body.email_id,
              "Reset Password ",
              html
            )
            .then(async function () {
              let r = await resetConfirm({
                otp,
                email_id: req.body.email_id,
                isConfirmed: 1,
              });
              if (!r) {
                return apiResponse.ErrorResponse(res, "Otp sent error");
              }
            });
          return apiResponse.successResponse(res, "Mail sent Success.");
        } else {
          return apiResponse.ErrorResponse(res, "Email not found");
        }
      }
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  },
];

exports.resetPassword = [
  body("email_id")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address."),
  body("password")
    .isLength({ min: 6 })
    .trim()
    .escape()
    .withMessage("Password must be 6 characters or greater."),
  body("otp")
    .isLength({ min: 6 })
    .trim()
    .escape()
    .withMessage("OTP must be 6 characters")
    .isNumeric()
    .withMessage("OTP must be numeric"),
  async function (req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        let user = await verifyOtp({
          email_id: req.body.email_id,
          otp: req.body.otp,
        });
        let data = user[0];
        if (data) {
          //hash input password
          bcrypt.hash(req.body.password, 10, async function (err, hash) {
            // generate OTP for confirmation
            let otp = utility.randomNumber(6);
            // Update user.
            let uu = await updatePassword({
              password: hash,
              id: data.id,
            });
            if (uu) {
              return apiResponse.successResponse(res, "Password Updated");
            } else {
              return apiResponse.ErrorResponse(res, "Error in update password");
            }
          });
        } else {
          return apiResponse.ErrorResponse(res, "Invalid OTP");
        }
      }
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  },
];
