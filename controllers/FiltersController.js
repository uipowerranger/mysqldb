const {
  filtersDelete,
  filtersList,
  filtersStore,
  filtersUpdate,
} = require("../services/FiltersService");
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
  auth,
  body("filter_name", "Filter name is required")
    .exists()
    .isString()
    .isLength({ min: 1 })
    .trim(),
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
        let s = await filtersStore(req.body);
        if (s.status === 200) {
          return apiResponse.successResponse(res, s.message);
        } else {
          return apiResponse.ErrorResponse(res, s.message);
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

exports.list = [
  async function (req, res) {
    try {
      let data = await filtersList();
      return apiResponse.successResponseWithData(res, "Success", data);
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.update = [
  auth,
  body("filter_name", "Filter name is required")
    .exists()
    .isString()
    .isLength({ min: 1 })
    .trim(),
  body("status", "Status is required").isLength({ min: 1 }).trim(),
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
        let u = await filtersUpdate({ ...req.body, id: req.params.id });
        if (u) {
          return apiResponse.successResponse(res, "Filter name update Success");
        } else {
          return apiResponse.ErrorResponse(res, "Filter name update Failed");
        }
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.delete = [
  auth,
  async function (req, res) {
    try {
      let del = await filtersDelete(req.params.id);
      if (del) {
        return apiResponse.successResponse(res, "Delete Success");
      } else {
        return apiResponse.ErrorResponse(res, "Delete Failed");
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
