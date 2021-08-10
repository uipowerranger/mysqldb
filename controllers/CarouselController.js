const {
  carouselDelete,
  carouselList,
  carouselStore,
  carouselUpdate,
} = require("../services/CarouselService");
const { body, validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");

exports.CauroselList = [
  async (req, res) => {
    try {
      let data = await carouselList();
      return apiResponse.successResponseWithData(res, "Success", data);
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  },
];

exports.CauroselStore = [
  auth,
  body("description")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Description must be specified."),
  body("image")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Image must be specified."),
  body("state").isLength({ min: 1 }).withMessage("State must be specified."),
  body("category")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Category must be specified."),
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
        let s = await carouselStore(req.body);
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

exports.CauroselUpdate = [
  auth,
  body("description")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Description must be specified."),
  body("image")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Image must be specified."),
  body("status")
    .isLength({ min: 1 })
    .withMessage("Status must be specified.")
    .isIn([0, 1])
    .withMessage("Status must be either 0, 1"),
  body("state").isLength({ min: 1 }).withMessage("State must be specified."),
  body("category")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Category must be specified."),
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
        let u = await carouselUpdate({ ...req.body, id: req.params.id });
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

exports.CauroselDelete = [
  auth,
  async (req, res) => {
    try {
      let data = await carouselDelete(req.params.id);
      if (data) {
        return apiResponse.successResponse(res, "Delete Success");
      } else {
        return apiResponse.ErrorResponse(res, "Delete Failed");
      }
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  },
];
