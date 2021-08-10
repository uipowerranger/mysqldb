const RedeemModel = require("../models/RedeemModel");
const { body, validationResult } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

/**
 * Get Redeem by user
 */

exports.RedeemList = [
  auth,
  (req, res) => {
    RedeemModel.find({ user: req.user._id })
      .then((response) => {
        return apiResponse.successResponseWithData(
          res,
          "Redeem Fetch",
          response
        );
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err);
      });
  },
];

/**
 * Total redeem
 */

exports.RedeemTotal = [
  auth,
  (req, res) => {
    try {
      RedeemModel.aggregate([
        {
          $project: {
            _id: 0,
            user: req.user._id,
            redeem: {
              $cond: {
                if: {
                  $eq: ["$user", mongoose.Types.ObjectId(req.user._id)],
                  $eq: ["$status", 1],
                },
                then: "$redeem_points",
                else: 0,
              },
            },
            redeem_used: {
              $cond: {
                if: {
                  $eq: ["$user", mongoose.Types.ObjectId(req.user._id)],
                  $eq: ["$status", 2],
                },
                then: "$redeem_points",
                else: 0,
              },
            },
          },
        },
        {
          $group: {
            _id: "$user",
            redeem_earned: { $sum: "$redeem" },
            redeem_used: { $sum: "$redeem_used" },
          },
        },
      ]).then((response) => {
        let data = {};
        response.map((r) => {
          data["_id"] = r._id;
          data["redeem_earned"] = r.redeem_earned;
          data["redeem_used"] = r.redeem_used;
          data["redeem_total"] = r.redeem_earned - r.redeem_used;
          return true;
        });
        return apiResponse.successResponseWithData(
          res,
          "Total Redeem Fetch",
          data
        );
      });
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  },
];
