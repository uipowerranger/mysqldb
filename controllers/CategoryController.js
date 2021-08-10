const {
  categoryList,
  categoryStore,
  categoryListByState,
  categoryDelete,
  categoryUpdate,
} = require("../services/CategoryService");
const { body, validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");

// Category Schema
function CategoryData(data) {
  this.id = data._id;
  this.category_name = data.category_name;
  this.state_details = data.state_details;
  this.post_code_details = data.post_code_details;
  this.createdAt = data.createdAt;
  this.image = data.image;
  this.order_number = data.order_number;
}

/**
 * Category List.
 *
 * @returns {Object}
 */
exports.CategoryList = [
  async function (req, res) {
    try {
      let cat = await categoryList();
      return apiResponse.successResponseWithData(res, "Success", cat);
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Category List by state.
 *
 * @returns {Object}
 */
exports.CategoryListByState = [
  async function (req, res) {
    try {
      let cat = await categoryListByState(req.params.state);
      return apiResponse.successResponseWithData(res, "Success", cat);
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Category store.
 *
 * @param {string}      category_name
 *
 * @returns {Object}
 */
exports.CategoryStore = [
  auth,
  body("category_name", "Name must not be empty.")
    .isLength({ min: 3 })
    .withMessage("Minimum 3 characters.")
    .trim()
    .escape(),
  body("state_details", "State must not be empty.").isLength({ min: 1 }).trim(),
  body("order_number", "Order number must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("post_code_details", "Post code must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("image", "Image must not be empty.").isLength({ min: 1 }).trim(),
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
        //Save Category.
        let category = await categoryStore(req.body);
        if (category.status === 500) {
          return apiResponse.ErrorResponse(res, category.message);
        } else {
          return apiResponse.successResponse(res, category.message);
        }
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Category update.
 *
 * @param {string}      title
 * @param {string}      description
 * @param {string}      isbn
 *
 * @returns {Object}
 */
exports.CategoryUpdate = [
  auth,
  body("category_name", "Name must not be empty.").isLength({ min: 1 }).trim(),
  body("status", "Status must not be empty.").isLength({ min: 1 }).trim(),
  body("state_details", "State must not be empty.").isLength({ min: 1 }).trim(),
  body("order_number", "Order Number must not be empty")
    .isLength({ min: 1 })
    .trim(),
  body("post_code_details", "Post code must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("image", "Image must not be empty.").isLength({ min: 1 }).trim(),
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
        let category = await categoryUpdate({ ...req.body, id: req.params.id });
        if (category.status === 500) {
          return apiResponse.ErrorResponse(res, category.message);
        } else {
          return apiResponse.successResponse(res, category.message);
        }
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Category Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.CategoryDelete = [
  auth,
  async function (req, res) {
    try {
      let del = await categoryDelete(req.params.id);
      if (del) {
        return apiResponse.successResponse(res, "Delete Success");
      } else {
        return apiResponse.ErrorResponse(res, "Category not found");
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
