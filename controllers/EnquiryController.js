const { store, list } = require("../services/EnquiryService");
const { body, validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");

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
exports.create = [
  // Validate fields.
  body("email_id", "Email is required")
    .exists()
    .isEmail()
    .withMessage("Enter valid email"),
  body("phone_number", "Phone number is required and should be string")
    .exists()
    .isString(),
  body("first_name", "Firstname is required").exists().isString(),
  body("last_name", "Lastname is required").exists().isString(),
  body("post_code", "Postcode is required and should be number")
    .exists()
    .isNumeric(),
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
        let s = await store(req.body);
        if (s) {
          return apiResponse.successResponse(
            res,
            "We have registered your enquiry We will comeback to you soon."
          );
        } else {
          return apiResponse.ErrorResponse(res, "Error Occured");
        }
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Orders List
 */

exports.EnquiryList = [
  async function (req, res) {
    try {
      let data = await list();
      console.log(data);
      return apiResponse.successResponseWithData(res, "Success", data);
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
