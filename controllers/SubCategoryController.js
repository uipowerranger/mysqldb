const {
  categoryStore,
  categoryList,
  categoryListById,
  categoryDelete,
  categoryUpdate,
} = require("../services/SubCategoryService");
const { body, validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");

// Category Schema
function CategoryData(data) {
  this.id = data._id;
  this.sub_category_name = data.sub_category_name;
  this.category = data.category;
  this.createdAt = data.createdAt;
}

/**
 * Category List.
 *
 * @returns {Object}
 */
exports.CategoryList = [
  async function (req, res) {
    try {
      let c = await categoryList();
      return apiResponse.successResponseWithData(res, "Success", c);
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.CategoryListById = [
  async function (req, res) {
    try {
      let c = await categoryListById(req.params.id);
      return apiResponse.successResponseWithData(res, "Success", c);
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Category store.
 *
 * @param {string}      sub_category_name
 *
 * @returns {Object}
 */
exports.CategoryStore = [
  auth,
  body("sub_category_name", "Name must not be empty.")
    .isLength({ min: 3 })
    .withMessage("Minimum 3 characters.")
    .trim()
    .escape(),
  body("category", "Category must not be empty").isLength({ min: 1 }).trim(),
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
        let sc = await categoryStore(req.body);
        if (sc.status === 200) {
          return apiResponse.successResponse(res, sc.message);
        } else {
          return apiResponse.ErrorResponse(res, sc.message);
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
  body("sub_category_name", "Name must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("status", "Status must not be empty.").isLength({ min: 1 }).trim(),
  body("category", "Category must not be empty").isLength({ min: 1 }).trim(),
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
        let u = await categoryUpdate({ ...req.body, id: req.params.id });
        if (u.status === 200) {
          return apiResponse.successResponse(res, u.message);
        } else {
          return apiResponse.ErrorResponse(res, u.message);
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
      let d = await categoryDelete(req.params.id);
      if (d) {
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
