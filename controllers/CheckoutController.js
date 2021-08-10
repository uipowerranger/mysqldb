const CheckoutModel = require("../models/CheckoutModel");
const ProductModel = require("../models/ProductModel");
const WishlistModel = require("../models/WishlistModel");
const { body, validationResult } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/jwt");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

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
        const { _id, ...rest } = req.body;
        CheckoutModel.find(
          { user: req.user._id, item_id: req.body.item_id },
          (err, existData) => {
            if (!err) {
              if (existData.length === 0) {
                var order = new CheckoutModel({
                  user: req.user._id,
                  ...rest,
                });
                // Save order.
                order.save(function (err) {
                  if (err) {
                    return apiResponse.ErrorResponse(res, err);
                  }
                  let orderData = {
                    _id: order._id,
                    createdAt: order.createdAt,
                  };
                  return apiResponse.successResponseWithData(
                    res,
                    "Checkout Success.",
                    orderData
                  );
                });
              } else {
                let oldData = existData[0];
                CheckoutModel.findByIdAndUpdate(
                  { _id: oldData._id },
                  rest,
                  {},
                  (err, respData) => {
                    if (err) {
                      return apiResponse.ErrorResponse(res, err);
                    }
                    let orderData = {
                      _id: respData._id,
                      createdAt: respData.createdAt,
                    };
                    return apiResponse.successResponseWithData(
                      res,
                      "Checkout Success.",
                      orderData
                    );
                  }
                );
              }
            } else {
              return apiResponse.ErrorResponse(res, err);
            }
          }
        );
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Bulk add
 */

exports.Bulkcreate = [
  auth,
  // Validate fields.
  body("items")
    .isLength({ min: 1 })
    .withMessage("Items cannot be empty")
    .isArray()
    .withMessage("Items must be Array of objects."),
  body("items.*.item_id", "Item_id must be a string").exists().isString(),
  body("items.*._id", "Wishlist Id must be a string").exists().isString(),
  body("items.*.quantity", "Quantity must be a number").exists().isInt(),
  body("items.*.price", "Price must be a Decimal").exists().isDecimal(),
  body("items.*.amount", "Amount must be a Decimal").exists().isDecimal(),
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
        const { _id, items } = req.body;
        items.map((item) => {
          CheckoutModel.find(
            { user: req.user._id, item_id: item.item_id },
            (err, existData) => {
              if (!err) {
                if (existData.length === 0) {
                  var order = new CheckoutModel({
                    user: req.user._id,
                    ...item,
                  });
                  // Save order.
                  order.save(function (err) {
                    if (err) {
                      return {
                        err: "error on add",
                      };
                    }
                    let orderData = {
                      _id: order._id,
                      createdAt: order.createdAt,
                    };
                    return {
                      message: "Checkout Success.",
                      data: orderData,
                    };
                  });
                } else {
                  let oldData = existData[0];
                  CheckoutModel.findByIdAndUpdate(
                    { _id: oldData._id },
                    item,
                    {},
                    (err, respData) => {
                      if (err) {
                        return {
                          err: "error on old add",
                        };
                      }
                      let orderData = {
                        _id: respData._id,
                        createdAt: respData.createdAt,
                      };
                      return {
                        message: "Checkout Success.",
                        data: orderData,
                      };
                    }
                  );
                }
              } else {
                return {
                  err: "err",
                };
              }
            }
          );
          WishlistModel.findOneAndDelete(
            { user: req.user._id, _id: item._id },
            {}
          ).then((data) => {});
        });
        return apiResponse.successResponse(res, "Checkout Added");
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
  function (req, res) {
    try {
      CheckoutModel.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "item_id",
            foreignField: "_id",
            as: "map_product",
          },
        },
        {
          $unwind: "$map_product",
        },
        {
          $match: {
            user: { $eq: mongoose.Types.ObjectId(req.user._id) },
          },
        },
        {
          $project: {
            __v: 0,
          },
        },
      ]).then((orders) => {
        if (orders.length > 0) {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            orders
          );
        } else {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            []
          );
        }
      });
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
  (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return apiResponse.validationErrorWithData(
          res,
          "Invalid Id",
          "Invalid Id"
        );
      } else {
        CheckoutModel.findByIdAndRemove(req.params.id).then((resp) => {
          return apiResponse.successResponse(res, "Deleted");
        });
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.deleteByUser = [
  auth,
  body("user_id", "User id is required").exists(),
  (req, res) => {
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
        if (!mongoose.Types.ObjectId.isValid(req.body.user_id)) {
          return apiResponse.validationErrorWithData(
            res,
            "Invalid Id",
            "Invalid Id"
          );
        } else {
          CheckoutModel.deleteMany({ user: req.body.user_id }).then((resp) => {
            return apiResponse.successResponse(res, "Deleted");
          });
        }
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.Update = [
  auth, // Validate fields.
  body("item_id", "Item_id must be a string").exists().isString(),
  body("quantity", "Quantity must be a number").exists().isInt(),
  body("price", "Price must be a Decimal").exists().isDecimal(),
  body("amount", "Amount must be a Decimal").exists().isDecimal(),
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
      } else if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return apiResponse.validationErrorWithData(
          res,
          "Invalid Error.",
          "Invalid ID"
        );
      } else {
        const { _id, ...rest } = req.body;
        var order = new CheckoutModel({
          user: req.user._id,
          ...rest,
          _id: req.params.id,
        });
        CheckoutModel.findById(req.params.id, function (err, foundData) {
          if (foundData === null) {
            return apiResponse.notFoundResponse(
              res,
              "Checkout not exists with this id"
            );
          } else {
            // Update order.
            CheckoutModel.findByIdAndUpdate(
              req.params.id,
              order,
              {},
              function (err) {
                if (err) {
                  return apiResponse.ErrorResponse(res, err);
                }
                return apiResponse.successResponseWithData(
                  res,
                  "Checkout Updated.",
                  order
                );
              }
            );
          }
        });
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
