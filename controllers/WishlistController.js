const { create, list, wishDelete } = require("../services/WishListService");
const { body, validationResult } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/jwt");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");
const moment = require("moment");

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
  // Validate fields.
  body("item_id", "Item_id must be a string").exists().isString(),
  body("quantity", "Quantity must be a number").exists().isInt(),
  body("price", "Price must be a Decimal").exists().isDecimal(),
  body("amount", "Amount must be a Decimal").exists().isDecimal(),
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
        let data = await create({
          ...req.body,
          status: 1,
          user: req.user._id,
          added_date: moment().format("YYYY-MM-DD"),
        });
        if (data) {
          return apiResponse.successResponse(res, "Wishlist Added");
        } else {
          return apiResponse.ErrorResponse(res, "Error");
        }
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Checkout List
 */

exports.CheckoutList = [
  auth,
  async function (req, res) {
    try {
      let orders = await list(req.user._id);
      return apiResponse.successResponseWithData(
        res,
        "Operation success",
        orders
      );
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Delete
 */

exports.delete = [
  auth,
  async (req, res) => {
    try {
      let del = await wishDelete(req.params.id);
      if (del) {
        return apiResponse.successResponse(res, "Delete Success");
      } else {
        return apiResponse.ErrorResponse(res, "Delete Failed");
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
