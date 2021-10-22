const {
  create,
  list,
  giftDelete,
  update,
} = require("../services/GiftBoxService");
const { body, validationResult } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const jwt = require("jsonwebtoken");
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
  // Validate fields.
  body("box_name", "Box name is required")
    .exists()
    .isLength({ min: 1 })
    .isString(),
  body("items_allowed", "Items count is required")
    .exists()
    .isLength({ min: 1 })
    .isString(),
  body("items")
    .isLength({ min: 1 })
    .withMessage("Items cannot be empty")
    .isArray()
    .withMessage("Items must be Array of objects."),
  body("items.*.item_id", "Item_id must be a string")
    .exists()
    .isLength({ min: 1 })
    .isString(),
  body("items.*.item_name", "Item name must be a string")
    .exists()
    .isLength({ min: 1 })
    .isString(),
  body("items.*.item_image", "Item image must be a string")
    .exists()
    .isLength({ min: 1 })
    .isString(),
  body("items.*.quantity", "Quantity must be a number")
    .exists()
    .isLength({ min: 1 })
    .isInt(),
  body("items.*.price", "Price must be a Decimal")
    .exists()
    .isLength({ min: 1 })
    .isDecimal(),
  body("items.*.amount", "Amount must be a Decimal")
    .exists()
    .isLength({ min: 1 })
    .isDecimal(),
  body("total_amount", "Total must be a Decimal")
    .exists()
    .isLength({ min: 1 })
    .isDecimal(),
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
        let gift_id = await create({
          box_name: req.body.box_name,
          status: 1,
          user: req.user._id,
          total_amount: req.body.total_amount,
          items_allowed: req.body.items_allowed,
          items: req.body.items,
        });
        if (gift_id) {
          return apiResponse.successResponse(
            res,
            "Giftbox Created successfully"
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

exports.list = [
  async function (req, res) {
    try {
      let data = await list();
      return apiResponse.successResponseWithData(
        res,
        "Operation Success",
        data
      );
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
      let del = await giftDelete(req.params.id);
      if (del) {
        return apiResponse.successResponse(res, "Deleted successfully");
      } else {
        return apiResponse.ErrorResponse(res, "Delete Failed");
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.update = [
  auth,
  // Validate fields.
  body("box_name", "Box name is required")
    .exists()
    .isLength({ min: 1 })
    .isString(),
  body("items_allowed", "Items count is required")
    .exists()
    .isLength({ min: 1 })
    .isString(),
  body("status", "Status is required").exists().isLength({ min: 1 }).isString(),
  body("items")
    .isLength({ min: 1 })
    .withMessage("Items cannot be empty")
    .isArray()
    .withMessage("Items must be Array of objects."),
  body("items.*.item_id", "Item_id must be a string")
    .exists()
    .isLength({ min: 1 })
    .isString(),
  body("items.*.item_name", "Item name must be a string")
    .exists()
    .isLength({ min: 1 })
    .isString(),
  body("items.*.item_image", "Item image must be a string")
    .exists()
    .isLength({ min: 1 })
    .isString(),
  body("items.*.quantity", "Quantity must be a number")
    .exists()
    .isLength({ min: 1 })
    .isInt(),
  body("items.*.price", "Price must be a Decimal")
    .exists()
    .isLength({ min: 1 })
    .isDecimal(),
  body("items.*.amount", "Amount must be a Decimal")
    .exists()
    .isLength({ min: 1 })
    .isDecimal(),
  body("total_amount", "Total must be a Decimal")
    .exists()
    .isLength({ min: 1 })
    .isDecimal(),
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
        let gift_id = await update({
          box_name: req.body.box_name,
          status: req.body.status,
          user: req.user._id,
          total_amount: req.body.total_amount,
          items_allowed: req.body.items_allowed,
          items: req.body.items,
          id: req.params.id,
        });
        if (gift_id) {
          return apiResponse.successResponse(
            res,
            "Giftbox Updated successfully"
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
