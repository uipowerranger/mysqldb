const {
  validateStatePostcode,
  categoryByState,
  subcategoryProducts,
} = require("../services/ClientServices");
const { body, validationResult } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");

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
exports.validateStatePostcode = [
  // Validate fields.
  body("state_id", "State Id must be a number").exists().isInt(),
  body("postcode", "Postcode must be a number").exists().isInt(),
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
        let data = await validateStatePostcode(req.body);
        if (data.length > 0) {
          return apiResponse.successResponseWithData(res, "Success", data);
        } else {
          return apiResponse.successResponseWithData(res, "Failed", data);
        }
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.getCategory = [
  body("state_id", "State Id must be a number").exists().isNumeric(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Display sanitized values/errors messages.
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        let data = await categoryByState(req.body.state_id);
        return apiResponse.successResponseWithData(res, "success", data);
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.subcategoryProducts = [
  body("category_id", "Category Id must be a number").exists().isNumeric(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Display sanitized values/errors messages.
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        let data = await subcategoryProducts(req.body.category_id);
        return apiResponse.successResponseWithData(res, "Success", data);
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
