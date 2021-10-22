const {
  postcodeList,
  postcodeDelete,
  postcodeStore,
  postcodeUpdate,
  postcodeListbyId,
} = require("../services/PostCodeService");
const { body, validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");

// Category Schema
function PostcodeData(data) {
  this.id = data._id;
  this.post_code = data.post_code;
  this.state = data.state;
  this.createdAt = data.createdAt;
}

/**
 * Category List.
 *
 * @returns {Object}
 */
exports.PostcodeList = [
  async function (req, res) {
    try {
      let response = await postcodeList();
      return apiResponse.successResponseWithData(res, "Success", response);
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.PostcodeListById = [
  async function (req, res) {
    try {
      let response = await postcodeListbyId(req.params.id);
      return apiResponse.successResponseWithData(res, "Success", response);
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Category store.
 *
 * @param {string}      post_code
 *
 * @returns {Object}
 */
exports.PostcodeStore = [
  auth,
  body("post_code", "Postcode must not be empty.")
    .isLength({ min: 3 })
    .withMessage("Minimum 3 characters.")
    .trim()
    .escape(),
  body("state", "State must not be empty").isLength({ min: 1 }).trim(),
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
        //Save postcode.
        let data = await postcodeStore(req.body);
        if (data.status === 200) {
          return apiResponse.successResponse(res, "Postcode saved");
        } else if (data.status === 400) {
          return apiResponse.ErrorResponse(res, "State id not exists");
        } else if (data.status === 500) {
          return apiResponse.ErrorResponse(res, "Postcode already exists");
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
exports.PostcodeUpdate = [
  auth,
  body("post_code", "Postcode must not be empty.").isLength({ min: 1 }).trim(),
  body("state", "State must not be empty").isLength({ min: 1 }).trim(),
  body("status", "Status must not be empty").isLength({ min: 1 }).trim(),
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
        //update Category.
        let update = await postcodeUpdate({ ...req.body, id: req.params.id });
        if (update.status === 200) {
          return apiResponse.successResponse(res, "Postcode updated");
        } else {
          return apiResponse.ErrorResponse(res, "State id doesn't exists");
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
exports.PostcodeDelete = [
  auth,
  async function (req, res) {
    try {
      let del = await postcodeDelete(req.params.id);
      if (del) {
        return apiResponse.successResponse(res, "Postcode deleted");
      } else {
        return apiResponse.ErrorResponse(res, "Postcode id doesn't exists");
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
