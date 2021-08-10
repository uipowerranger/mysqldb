const { cityStore, cityList, cityDelete } = require("../services/CityServices");
const { body, validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");

exports.CityListByState = [
  async function (req, res) {
    try {
      let response = await cityList(req.params.id);
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
 * @param {string}      category_name
 *
 * @returns {Object}
 */
exports.CityStore = [
  auth,
  body("city_name", "City Name must not be empty.")
    .isLength({ min: 3 })
    .withMessage("Minimum 3 characters.")
    .trim()
    .escape(),
  body("state_id", "State must not be empty.").isLength({ min: 1 }).trim(),
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
        //Save city.
        let data = await cityStore(req.body);
        if (data.status === 200) {
          return apiResponse.successResponse(res, "City saved");
        } else if (data.status === 400) {
          return apiResponse.ErrorResponse(res, "State id not exists");
        } else if (data.status === 500) {
          return apiResponse.ErrorResponse(res, "City already exists");
        }
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.CityDelete = [auth, async (req, res) => {}];
