const {
  register,
  login,
  userList,
  verifyOtp,
  updateOtp,
  getUserById,
  userGetByEmail,
  updatePassword,
  updateUser,
} = require("../services/UserService");
const { body, validationResult } = require("express-validator");
//helper file to prepare responses.
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
  (req, res) => {
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
        //hash input password
        bcrypt.hash(req.body.password, 10, async function (err, hash) {
          // generate OTP for confirmation
          let otp = utility.randomNumber(6);
          // Create User object with escaped and trimmed data
          const { password, confirmOTP, id, ...rest } = req.body;
          var user = {
            password: hash,
            confirmOTP: otp,
            ...rest,
          };
          // Save user.
          let data = await register(user);
          if (data.status === 200) {
            // Html email body
            let link =
              process.env.PAYMENT_URL +
              "/#/verify-email?email=" +
              user.email_id +
              "&otp=" +
              otp;
            let html =
              "<p>Please Verify your Account.</p><p>Click on the link to verify your email</p><p><a href='" +
              link +
              "'>Verify Email</a></p>";
            // Send confirmation email
            mailer
              .send(
                constants.confirmEmails.from,
                user.email_id,
                "Verify Account ",
                html
              )
              .then(function () {
                let userData = {
                  _id: user._id,
                  first_name: user.first_name,
                  last_name: user.last_name,
                  email_id: user.email_id,
                  phone_number: user.phone_number,
                  address: user.address,
                  city: user.city,
                  state: user.state,
                  post_code: user.post_code,
                };
                return apiResponse.successResponseWithData(
                  res,
                  "Registration Success. Please Check your Registered email",
                  userData
                );
              })
              .catch((err) => {
                return apiResponse.ErrorResponse(res, "Error in sending mail");
              });
          } else {
            return apiResponse.ErrorResponse(res, data.message);
          }
        });
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
exports.UserUpdate = [
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
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        let data = await updateUser({ ...req.body, id: req.params.id });
        if (data.status === 200) {
          let userData = {
            id: data.admin_data.id,
            first_name: data.admin_data.first_name,
            last_name: data.admin_data.last_name,
            email_id: data.admin_data.email_id,
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

exports.UserUpdatePassword = [
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
        let foundAdmin = await getUserById(req.params.id);
        if (foundAdmin.length === 0) {
          return apiResponse.notFoundResponse(
            res,
            "User not exists with this id"
          );
        } else {
          //update admin.
          bcrypt.compare(
            req.body.old_password,
            foundAdmin[0].password,
            function (err, same) {
              if (same) {
                bcrypt.hash(
                  req.body.new_password,
                  10,
                  async function (err, hash) {
                    if (err) {
                      return apiResponse.ErrorResponse(res, err);
                    } else {
                      await updatePassword({
                        password: hash,
                        id: foundAdmin[0].id,
                      });
                      return apiResponse.successResponse(
                        res,
                        "Password updated successfully"
                      );
                    }
                  }
                );
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
                if (user.isConfirmed) {
                  // Check User's account active or not.
                  if (user.status) {
                    let otp = utility.randomNumber(6);
                    let userData = {
                      _id: user.id,
                      first_name: user.first_name,
                      last_name: user.last_name,
                      email_id: user.email_id,
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
                    return apiResponse.unauthorizedResponse(
                      res,
                      "Account is not active. Please contact admin."
                    );
                  }
                } else {
                  return apiResponse.ErrorResponse(
                    res,
                    "Email is not Confirmed."
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
          if (user) {
            let otp = utility.randomNumber(6);
            //Check already confirm or not.
            if (!user.isConfirmed) {
              //Check account confirmation.
              await updateOtp({
                otp,
                id: user.id,
              });
              if (user.confirmOTP == req.body.otp) {
                //Update user as confirmed

                let userData = {
                  _id: user.id,
                  first_name: user.first_name,
                  last_name: user.last_name,
                  email_id: user.email_id,
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
                return apiResponse.unauthorizedResponse(
                  res,
                  "Otp does not match"
                );
              }
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
        let resp = await userGetByEmail(query);
        let user = resp[0];
        if (user) {
          //Check already confirm or not.
          if (true) {
            // Generate otp
            let otp = utility.randomNumber(6);
            // Html email body
            let link =
              process.env.PAYMENT_URL +
              "/#/verify-email?email=" +
              user.email_id +
              "&otp=" +
              otp;
            let html =
              "<p>Please Verify your Account.</p><p>Click on the link to verify your email</p><p><a href='" +
              link +
              "'>Verify Email</a></p>";
            // Send confirmation email
            mailer
              .send(
                constants.confirmEmails.from,
                req.body.email_id,
                "Verify Account",
                html
              )
              .then(async function () {
                await updateOtp({
                  otp,
                  id: user.id,
                });
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

exports.getUserById = [
  auth,
  async function (req, res) {
    try {
      let admindata = await getUserById(req.params.id);
      if (admindata.length > 0) {
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          admindata[0]
        );
      } else {
        return apiResponse.ErrorResponse(res, "User not found");
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Get Admins
 */
exports.UsersList = [
  auth,
  async function (req, res) {
    try {
      let data = await userList(req.user._id);
      return apiResponse.successResponseWithData(res, "Success", data);
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Get Home Data
 */
exports.HomeData = [
  async function (req, res) {
    try {
      return apiResponse.successResponseWithData(res, "Success", []);
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
        var query = { email_id: req.body.email_id };
        let resp = await userGetByEmail(query);
        if (resp.length > 0) {
          let data = resp[0];
          let otp = utility.randomNumber(6);
          let url =
            process.env.PAYMENT_URL +
            `/#/reset-pwd?email=${data.email_id}&otp=${otp}`;
          // Html email body
          let html =
            `<h4>${otp} is your OTP please use it to reset password</h4>` +
            "<p>Click on the link to reset password</p><p><a href='" +
            url +
            "'>Reset Password</a></p>";
          // Send confirmation email
          mailer
            .send(
              constants.confirmEmails.from,
              req.body.email_id,
              "Reset Password ",
              html
            )
            .then(async function () {
              await updateOtp({
                otp,
                id: data.id,
              });
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
        let resp = await verifyOtp(req.body);
        if (resp.length > 0) {
          let data = resp[0];
          //hash input password
          bcrypt.hash(req.body.password, 10, async function (err, hash) {
            // generate OTP for confirmation
            let otp = utility.randomNumber(6);
            // Create User object with escaped and trimmed data
            if (err) {
              return apiResponse.ErrorResponse(res, err);
            } else {
              await updatePassword({
                password: hash,
                id: data.id,
              });
              await updateOtp({
                otp,
                id: data.id,
              });
              return apiResponse.successResponse(
                res,
                "Password updated successfully"
              );
            }
          });
        } else {
          return apiResponse.ErrorResponse(res, "Email link has expired");
        }
      }
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  },
];
