const {
  productStore,
  productUpdate,
  productDelete,
  allProducts,
  allProductsList,
  productsByState,
  productsByCategory,
  productsBySubCategory,
  productSearchByState,
  productsByStateCategory,
} = require("../services/ProductService");
const { body, query, validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");

/**
 * By State
 */

exports.ProductListByState = [
  async function (req, res) {
    try {
      let data = await productsByState(req.params.id);
      return apiResponse.successResponseWithData(res, "Success", data);
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.ProductListSearchByState = [
  body("state_id", "State Id must be required").isLength({ min: 1 }).trim(),
  body("search_string", "Search must be minimum 3 characters")
    .isLength({ min: 3 })
    .trim(),
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
        let data = await productSearchByState(req.body);
        return apiResponse.successResponseWithData(res, "Success", data);
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.ProductListSearchByStateandCategory = [
  body("state_id", "State Id must be required").isLength({ min: 1 }).trim(),
  body("category_id", "Category Id must be required")
    .isLength({ min: 1 })
    .trim(),
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
        let data = await productsByStateCategory(req.body);
        return apiResponse.successResponseWithData(res, "Success", data);
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Product List.
 *
 * @returns {Object}
 */
exports.ProductList = [
  async function (req, res) {
    try {
      let data = await allProducts();
      return apiResponse.successResponseWithData(res, "Success", data);
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * All Products
 */

exports.AllProductList = [
  async function (req, res) {
    try {
      let data = await allProductsList();
      return apiResponse.successResponseWithData(res, "Success", data);
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Products By Category
 */

exports.ProductListByCategory = [
  async (req, res) => {
    try {
      let data = await productsByCategory(req.params.id);
      return apiResponse.successResponseWithData(res, "Success", data);
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Products by Sub category
 */

exports.ProductListBySubCategory = [
  async function (req, res) {
    try {
      let data = await productsBySubCategory(req.params.id);
      return apiResponse.successResponseWithData(res, "Success", data);
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Product store.
 *
 * @param {string}      category_name
 *
 * @returns {Object}
 */
exports.ProductStore = [
  auth,
  body("item_name", "Name must not be empty.")
    .isLength({ min: 3 })
    .withMessage("Minimum 3 characters.")
    .trim()
    .escape(),
  body("price", "Price must not be empty.")
    .isLength({ min: 1 })
    .withMessage("Minimum 1 characters.")
    .trim(),
  body("actualPrice", "Actual Price must not be empty.")
    .isLength({ min: 1 })
    .withMessage("Minimum 1 characters.")
    .trim(),
  body("weight", "Weight must not be empty.")
    .isLength({ min: 1 })
    .withMessage("Minimum 1 characters.")
    .trim(),
  body("items_available", "Items vailable must not be empty.")
    .isLength({ min: 1 })
    .withMessage("Minimum 1 characters.")
    .trim(),
  body("category_details", "Category must not be empty")
    .isLength({ min: 1 })
    .trim(),
  body("sub_category_details", "Sub Category must not be empty.")
    .isLength({ min: 1 })
    .withMessage("Minimum 1 characters.")
    .trim()
    .escape(),
  body("state_details", "State must not be empty").isLength({ min: 1 }).trim(),
  body("post_code_details", "Post Code must not be empty.")
    .isLength({ min: 1 })
    .withMessage("Minimum 1 characters.")
    .trim()
    .escape(),
  body("units", "Units must not be empty.")
    .isLength({ min: 1 })
    .withMessage("Minimum 1 characters."),
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
        //Save Product.
        let s = await productStore({ ...req.body, user: req.user.id });
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
 * Product update.
 *
 * @param {string}      title
 * @param {string}      description
 * @param {string}      isbn
 *
 * @returns {Object}
 */
exports.ProductUpdate = [
  auth,
  body("item_name", "Name must not be empty.").isLength({ min: 1 }).trim(),
  body("category_details", "Category must not be empty")
    .isLength({ min: 1 })
    .trim(),
  body("sub_category_details", "Sub Category must not be empty.")
    .isLength({ min: 1 })
    .withMessage("Minimum 1 characters.")
    .trim()
    .escape(),
  body("state_details", "State must not be empty").isLength({ min: 1 }).trim(),
  body("post_code_details", "Post Code must not be empty.")
    .isLength({ min: 1 })
    .withMessage("Minimum 1 characters.")
    .trim()
    .escape(),
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
        let s = await productUpdate({
          ...req.body,
          user: req.user.id,
          id: req.params.id,
        });
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
 * Product Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.ProductDelete = [
  auth,
  async function (req, res) {
    try {
      let del = await productDelete({
        id: req.params.id,
        status: req.params.status,
      });
      if (del) {
        return apiResponse.successResponse(res, "Product delete success");
      } else {
        return apiResponse.ErrorResponse(res, "Product delete failed");
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
