const OrderModel = require("../models/OrderModel");
const ProductModel = require("../models/ProductModel");
const UserModel = require("../models/UserModel");
const RedeemModel = require("../models/RedeemModel");
const StockMoveModel = require("../models/StockMoveModel");
const { body, validationResult } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/jwt");
const mailer = require("../helpers/mailer");
const eway = require("../helpers/eway");
const twilio = require("../helpers/twilio");
const { constants } = require("../helpers/constants");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

/**
 * User registration.
 *
 * @param {string}      first_name
 * @param {string}      last_name
 * @param {string}      email_id
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.create = [
  auth,
  // Validate fields.
  body("first_name", "First name is required").exists().isString(),
  body("last_name", "Last name is required").exists().isString(),
  body("items")
    .isLength({ min: 1 })
    .withMessage("Items cannot be empty")
    .isArray()
    .withMessage("Items must be Array of objects."),
  body("items.*.item_id", "Item_id must be a string").exists().isString(),
  body("items.*.item_name", "Item name must be a string").exists().isString(),
  body("items.*.item_image", "Item image must be a string").exists().isString(),
  body("items.*.quantity", "Quantity must be a number").exists().isInt(),
  body("items.*.price", "Price must be a Decimal").exists().isDecimal(),
  body("items.*.amount", "Amount must be a Decimal").exists().isDecimal(),
  body("total_amount", "Total must be a Decimal").exists().isDecimal(),
  body("email_id", "Email is required").exists().isString(),
  body("phone_number", "Phone number is required").exists().isString(),
  body("mailing_address.address1", "Mailing address1 must be entered")
    .exists()
    .isString(),
  body("mailing_address.city", "Mailing City must be entered")
    .exists()
    .isString(),
  body("mailing_address.state", "Mailing State must be entered")
    .exists()
    .isString(),
  body("mailing_address.postcode", "Mailing Postcode Code must be entered")
    .exists()
    .isString(),
  body("shipping_address.address1", "Shipping address1 must be entered")
    .exists()
    .isString(),
  body("shipping_address.city", "Shipping City must be entered")
    .exists()
    .isString(),
  body("shipping_address.state", "Shipping State must be entered")
    .exists()
    .isString(),
  body("shipping_address.postcode", "Shipping Postcode Code must be entered")
    .exists()
    .isString(),
  body("state_details", "User selected state details is required")
    .exists()
    .isString(),
  body("redeempoints_used", "User redeempoints_used is required")
    .exists()
    .isNumeric(),
  // Process request after validation and sanitization.
  (req, res) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Display sanitized values/errors messages.
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        const { _id, ...rest } = req.body;
        var order = new OrderModel({
          user: req.user._id,
          ...rest,
        });
        // Save order.
        order.save(function (err) {
          if (err) {
            return apiResponse.ErrorResponse(res, err);
          }
          let paymentData = {
            Customer: {
              FirstName: req.body.first_name,
              LastName: req.body.last_name,
              Street1: req.body.mailing_address.address1,
              Street2: req.body.mailing_address.address2,
              City: req.body.mailing_address.city,
              State: req.body.mailing_address.state,
              PostalCode: req.body.mailing_address.postcode,
              Country: "au",
              Email: req.body.email_id,
              Mobile: req.body.phone_number,
              Phone: req.body.phone_number,
            },
            Payment: {
              TotalAmount: Number(req.body.total_amount) * 100,
              InvoiceNumber: order._id,
              InvoiceDescription: "Birlamart Purchase",
              InvoiceReference: "",
              CurrencyCode: "AUD",
            },
          };
          //console.log(paymentData);
          eway
            .payment(paymentData)
            .then(function (response) {
              if (response.getErrors().length == 0) {
                var redirectURL = response.get("SharedPaymentUrl");
                let orderData = {
                  _id: order._id,
                  createdAt: order.createdAt,
                  redirectURL: redirectURL,
                };
                return apiResponse.successResponseWithData(
                  res,
                  "Order Success.",
                  orderData
                );
              } else {
                return apiResponse.ErrorResponse(res, response);
              }
            })
            .catch(function (reason) {
              reason.getErrors().forEach(function (error) {
                console.log("Response Messages: " + (error, "en"));
              });
              return apiResponse.ErrorResponse(res, reason.getErrors());
            });
        });
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Orders List
 */

exports.OrdersList = [
  auth,
  function (req, res) {
    try {
      OrderModel.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "map_user",
          },
        },
        // {
        //   $lookup: {
        //     from: "products",
        //     localField: "items",
        //     foreignField: "_id",
        //     as: "map_products",
        //   },
        // },
        {
          $match: {
            user: { $eq: mongoose.Types.ObjectId(req.user._id) },
          },
        },
        {
          $project: {
            __v: 0,
            "map_user.password": 0,
            "map_user.createdAt": 0,
            "map_user.updatedAt": 0,
          },
        },
      ]).then((orders) => {
        if (orders.length > 0) {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            orders
          );
        } else {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            []
          );
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.OrdersListAll = [
  function (req, res) {
    try {
      OrderModel.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "map_user",
          },
        },
        // {
        //   $lookup: {
        //     from: "products",
        //     localField: "items",
        //     foreignField: "_id",
        //     as: "map_products",
        //   },
        // },
        // {
        //   $match: {
        //     user: { $eq: mongoose.Types.ObjectId(req.user._id) },
        //   },
        // },
        {
          $project: {
            __v: 0,
            "map_user.password": 0,
            "map_user.createdAt": 0,
            "map_user.updatedAt": 0,
          },
        },
      ]).then((orders) => {
        if (orders.length > 0) {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            orders
          );
        } else {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            []
          );
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.OrdersByDate = [
  auth,
  body("from_date", "From date is required").exists(),
  body("to_date", "To date is required").exists(),
  function (req, res) {
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
        OrderModel.aggregate([
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "map_user",
            },
          },
          {
            $match: {
              order_date: {
                $gte: new Date(
                  new Date(req.body.from_date).setHours(00, 00, 00)
                ),
                $lt: new Date(new Date(req.body.to_date).setHours(23, 59, 59)),
              },
            },
          },
        ]).then((orders) => {
          if (orders.length > 0) {
            return apiResponse.successResponseWithData(
              res,
              "Operation success",
              orders
            );
          } else {
            return apiResponse.successResponseWithData(
              res,
              "Operation success",
              []
            );
          }
        });
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.OrderUpdateStatus = [
  auth,
  body("order_id", "Order id is required").exists(),
  body("payment", "payment status is required")
    .notEmpty()
    .isIn([0, 1])
    .withMessage("Values should be either 0 or 1"),
  body("order_completed", "order_completed status is required")
    .notEmpty()
    .isIn([0, 1])
    .withMessage("Values should be either 0 or 1"),
  (req, res) => {
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
        if (!mongoose.Types.ObjectId.isValid(req.body.order_id)) {
          return apiResponse.validationErrorWithData(
            res,
            "Invalid Error.",
            "Invalid ID"
          );
        } else {
          const { order_id, ...rest } = req.body;
          OrderModel.updateOne(
            { _id: req.body.order_id },
            rest,
            function (err, data) {
              if (err) {
                return apiResponse.ErrorResponse(res, err);
              } else {
                return apiResponse.successResponseWithData(
                  res,
                  "Order Updated",
                  data
                );
              }
            }
          );
        }
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

const getUserData = async (user) => {
  return new Promise((resolve, reject) => {
    UserModel.findById(user)
      .then((user) => resolve(user))
      .catch((err) => reject(user));
  });
};

exports.VerifyToken = [
  auth,
  body("AccessCode", "AccessCode is required")
    .exists()
    .isLength({ min: 10 })
    .withMessage("AccessCode cannot be empty"),
  (req, res) => {
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
        eway
          .getAccessCode(req.body.AccessCode)
          .then(function (response) {
            if (response.get("Transactions[0].TransactionStatus")) {
              OrderModel.findById(
                response.get("Transactions[0].InvoiceNumber"),
                async (err, data) => {
                  let userData = await getUserData(data.user);
                  let user = data.user;
                  if (!!userData && !!userData.first_name) {
                    user = userData.first_name + " " + userData.last_name;
                  }
                  if (!err) {
                    OrderModel.updateOne(
                      { _id: response.get("Transactions[0].InvoiceNumber") },
                      { payment: 1 },
                      function (err, data) {}
                    );
                    if (data.total_amount >= 100) {
                      let redeem = Math.ceil(data.total_amount / 100);
                      let redeemData = new RedeemModel({
                        date: data.order_date,
                        user: data.user,
                        order_id: data._id,
                        total_amount: data.total_amount,
                        redeem_points: redeem,
                      });
                      redeemData.save((err, msg) => {});
                    }
                    if (data.redeempoints_used > 0) {
                      let redeemDataUsed = new RedeemModel({
                        date: data.order_date,
                        user: data.user,
                        order_id: data._id,
                        total_amount: data.total_amount,
                        redeem_points: data.redeempoints_used,
                        status: 2,
                      });
                      redeemDataUsed.save((err, msg) => {});
                    }
                    data.items.map((it) => {
                      let stock = new StockMoveModel({
                        date: data.order_date,
                        user: data.user,
                        order_id: data._id,
                        item_id: it.item_id,
                        quantity: it.quantity,
                        status: 1,
                        transactionType: "By Order",
                      });
                      stock.save((err, msg) => {});
                    });
                    let html = `<html lang="en">

                      <head>
                          <meta charset="UTF-8">
                          <meta http-equiv="X-UA-Compatible" content="IE=edge">
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      </head>

                      <body>
                          <div style="text-align: center;">
                              <h4>Birlamart Invoice</h4>
                          </div>
                          <div>
                              <p>Hello <strong>${user}</strong>...! </p>
                              <p>Thank You for Your Order:</p>
                              <p>For More Shopping Please visit <a href="https:www.birlamart.com">www.birlamart.com </a> </p>
                              <h4><u> Order Details:</u></h4>
                              <p>Customer Name:<strong>${user}</strong> </p>
                              <p>Order Id:<strong>${data._id}</strong></p>
                              <p>Order Date:<strong>${data.order_date}</strong></p>
                              <p>Total Items:<strong>${data.items.length}</strong></p>
                              <p>Total Price:<strong>${data.total_amount}</strong></p>
                              <p>Bill Type: <strong>Visa/MasterCard/CreditCard/DebitCard</strong> </p>
                              <h4><u> Order Summary:</u></h4>`;

                    html =
                      html +
                      `<table width="50%" border="2" style="margin:30px 10px;border-radius: 13px; border-spacing: 0; padding: 10px;">
                      <thead style=" background-color: #F1D4AF; border: 0;border-radius: 0;">
                          <tr>
                              <th>Sl.No</th>
                              <th>Product Name</th>
                              <th>Quantity</th>
                              <th>Price</th>
                          </tr>
                      </thead>
                      <tbody>`;
                    let orders = data.items.map((it, i) => {
                      return (
                        "<tr><td>" +
                        parseInt(i + 1) +
                        "</td><td>" +
                        it.item_name +
                        "</td><td style='align-items:center'>" +
                        it.quantity +
                        "</td><td style='align-items:center'>" +
                        it.price +
                        "</td></tr>"
                      );
                    });
                    html = html + orders.join("");
                    html =
                      html +
                      `</tbody>
                                  <tfoot style=" background-color: #C5E0DC;">
                                  <tr>
                                      <td colspan=" 3">
                                      </td>
                                      <td> <strong>$${data.total_amount} (AU)</strong> </td>
                                  </tr>
                              </tfoot>
                          </table>
                          <div style="margin: 30px;">
                              <h4>Thanks,</h4>
                              <h4>Birlamart Team</h4>

                          </div>
                      </div>
                  </body>

                  </html>`;

                    // Send confirmation email
                    let customerPhone = response.get(
                      "Transactions[0].Customer"
                    );
                    if (!!customerPhone.Phone) {
                      twilio
                        .create(
                          customerPhone.Phone,
                          `Your order with reference to order Id: ${response.get(
                            "Transactions[0].InvoiceNumber"
                          )} has been placed successfully on ${new Date().toLocaleString()} \n -Birlamart Team`
                        )
                        .then((tres) => console.log(tres.sid))
                        .catch((err) => console.log(err));
                    }
                    mailer
                      .send(
                        constants.confirmEmails.from,
                        data.email_id,
                        "Your Order on Birlamart",
                        html
                      )
                      .then(function () {
                        return apiResponse.successResponseWithData(
                          res,
                          "Payment Success",
                          {
                            transaction: {
                              TransactionID: response.get(
                                "Transactions[0].TransactionID"
                              ),
                              TransactionStatus: response.get(
                                "Transactions[0].TransactionStatus"
                              ),
                              AuthorisationCode: response.get(
                                "Transactions[0].AuthorisationCode"
                              ),
                              ResponseCode: response.get(
                                "Transactions[0].ResponseCode"
                              ),
                              ResponseMessage: response.get(
                                "Transactions[0].ResponseMessage"
                              ),
                              InvoiceNumber: response.get(
                                "Transactions[0].InvoiceNumber"
                              ),
                              InvoiceReference: response.get(
                                "Transactions[0].InvoiceReference"
                              ),
                              TotalAmount: response.get(
                                "Transactions[0].TotalAmount"
                              ),
                              Customer: response.get(
                                "Transactions[0].Customer"
                              ),
                            },
                          }
                        );
                      })
                      .catch((err) => {
                        return apiResponse.successResponseWithData(
                          res,
                          "Payment Success",
                          {
                            transaction: {
                              TransactionID: response.get(
                                "Transactions[0].TransactionID"
                              ),
                              TransactionStatus: response.get(
                                "Transactions[0].TransactionStatus"
                              ),
                              AuthorisationCode: response.get(
                                "Transactions[0].AuthorisationCode"
                              ),
                              ResponseCode: response.get(
                                "Transactions[0].ResponseCode"
                              ),
                              ResponseMessage: response.get(
                                "Transactions[0].ResponseMessage"
                              ),
                              InvoiceNumber: response.get(
                                "Transactions[0].InvoiceNumber"
                              ),
                              InvoiceReference: response.get(
                                "Transactions[0].InvoiceReference"
                              ),
                              TotalAmount: response.get(
                                "Transactions[0].TotalAmount"
                              ),
                              Customer: response.get(
                                "Transactions[0].Customer"
                              ),
                            },
                          }
                        );
                      });
                  } else {
                    return apiResponse.ErrorResponse(res, "Error occured");
                  }
                }
              );
            } else {
              var errorCodes = response
                .get("Transactions[0].ResponseMessage")
                .split(", ");
              return apiResponse.ErrorResponse(res, errorCodes);
            }
          })
          .catch(function (reason) {
            return apiResponse.ErrorResponse(res, "Payment Failed");
          });
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
