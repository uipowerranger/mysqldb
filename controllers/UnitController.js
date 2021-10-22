const {
  unitsDelete,
  unitsList,
  unitsStore,
  unitsUpdate,
} = require("../services/UnitsService");
const { body, validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");

exports.UnitList = [
  async (req, res) => {
    try {
      let data = await unitsList();
      return apiResponse.successResponseWithData(res, "Success", data);
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  },
];

exports.UnitStore = [
  auth,
  body("unit_name")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Unit name must be specified."),
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
        let s = await unitsStore(req.body);
        if (s.status === 200) {
          return apiResponse.successResponse(res, s.message);
        } else {
          return apiResponse.ErrorResponse(res, s.message);
        }
      }
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  },
];

exports.UnitUpdate = [
  auth,
  body("status").isLength({ min: 1 }).withMessage("Status must be specified."),
  body("unit_name")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Unit name must be specified."),
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
        let u = await unitsUpdate({ ...req.body, id: req.params.id });
        if (u.status === 200) {
          return apiResponse.successResponse(res, u.message);
        } else {
          return apiResponse.ErrorResponse(res, u.message);
        }
      }
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  },
];

exports.UnitDelete = [
  auth,
  async (req, res) => {
    try {
      let del = await unitsDelete(req.params.id);
      if (del) {
        return apiResponse.successResponse(res, "Delete Success");
      } else {
        return apiResponse.ErrorResponse(res, "Delete Failed");
      }
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  },
];
