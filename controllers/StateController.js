const {
  stateList,
  stateListbyId,
  stateStore,
  stateDelete,
  stateUpdate,
} = require("../services/StateService");
const { body, validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");

// Category Schema
function StateData(data) {
  this.id = data._id;
  this.state_name = data.state_name;
  this.createdAt = data.createdAt;
}

/**
 * State List.
 *
 * @returns {Object}
 */
exports.StateList = [
  async function (req, res) {
    try {
      let response = await stateList();
      return apiResponse.successResponseWithData(res, "Success", response);
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * By Id
 */

exports.StateListById = [
  async function (req, res) {
    try {
      let response = await stateListbyId(req.params.id);
      return apiResponse.successResponseWithData(res, "Success", response);
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * State store.
 *
 * @param {string}      state_name
 *
 * @returns {Object}
 */
exports.StateStore = [
  auth,
  body("state_name", "Name must not be empty.")
    .isLength({ min: 3 })
    .withMessage("Minimum 3 characters.")
    .trim()
    .escape(),
  body("postcode_from", "Post Code from must not be empty.")
    .isLength({ min: 4 })
    .withMessage("Minimum 4 characters."),
  body("postcode_to", "Post Code to must not be empty.")
    .isLength({ min: 4 })
    .withMessage("Minimum 4 characters."),
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
        let state = await stateStore(req.body);
        if (state.status === 200) {
          return apiResponse.successResponse(res, "State add Success.");
        } else {
          return apiResponse.ErrorResponse(res, "State name already exists");
        }
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * State update.
 *
 * @param {string}      title
 * @param {string}      description
 * @param {string}      isbn
 *
 * @returns {Object}
 */
exports.StateUpdate = [
  auth,
  body("state_name", "Name must not be empty.").isLength({ min: 1 }).trim(),
  body("status", "Status must not be empty.").isLength({ min: 1 }).trim(),
  body("postcode_from", "Postcode from must not be empty.")
    .isLength({ min: 4 })
    .trim(),
  body("postcode_to", "Postcode to must not be empty.")
    .isLength({ min: 4 })
    .trim(),
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
        //update State.
        let update = await stateUpdate({ ...req.body, id: req.params.id });
        if (update) {
          return apiResponse.successResponse(res, "State update Success.");
        } else {
          return apiResponse.ErrorResponse(res, "State doesn't exists");
        }
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * State Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.StateDelete = [
  auth,
  async function (req, res) {
    try {
      //delete State.
      let del = await stateDelete(req.params.id);
      if (del) {
        return apiResponse.successResponse(res, "State delete Success.");
      } else {
        return apiResponse.ErrorResponse(res, "State doesn't exist");
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
