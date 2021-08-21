const { getRedeem, totalRedeem } = require("../services/RedeemService");
const { body, validationResult } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");

/**
 * Get Redeem by user
 */

exports.RedeemList = [
  auth,
  async (req, res) => {
    try {
      let data = await getRedeem(req.user._id);
      return apiResponse.successResponseWithData(res, "Success", data);
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Total redeem
 */

exports.RedeemTotal = [
  auth,
  async (req, res) => {
    try {
      let response = await totalRedeem(req.user._id);
      let data = {};
      data["redeem_earned"] = response.earn;
      data["redeem_used"] = response.used;
      data["redeem_total"] = response.earn - response.used;
      return apiResponse.successResponseWithData(
        res,
        "Total Redeem Fetch",
        data
      );
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  },
];
