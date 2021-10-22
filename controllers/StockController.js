const {
  productById,
  getStockBuySell,
  allProducts,
  getStockMovement,
  stockAdj,
} = require("../services/ProductService");
const { body, validationResult } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
const moment = require("moment");
/**
 * Get stock by item
 */

exports.Product = [
  auth,
  async (req, res) => {
    try {
      let response = await productById(req.params.id);
      if (response.length > 0) {
        let stock = await getStockBuySell(response[0].id);
        let data = {};
        data["item_id"] = response[0].id;
        data["item_name"] = response[0].item_name;
        data["image"] = response[0].image;
        data["totalPurchase"] = stock.buy;
        data["totalSold"] = stock.sell;
        data["currentStock"] = stock.buy - stock.sell;
        return apiResponse.successResponseWithData(res, "Stock Fetch", data);
      } else {
        return apiResponse.successResponse(res, "No Stock found");
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.MovementProduct = [
  auth,
  async (req, res) => {
    try {
      let response = await productById(req.params.id);
      if (response.length > 0) {
        let stock = await getStockMovement(response[0].id);
        let data = stock.map((s) => {
          let data1 = {};
          data1["item_id"] = response[0].id;
          data1["item_name"] = response[0].item_name;
          data1["image"] = response[0].image;
          data1["date"] = s.date;
          data1["user"] = s.user;
          data1["order_id"] = s.order_id;
          data1["soldQuantity"] = s.status === 2 ? s.quantity : 0;
          data1["purchaseQuantity"] = s.status === 1 ? s.quantity : 0;
          return data1;
        });
        return apiResponse.successResponseWithData(res, "Stock Fetch", data);
      } else {
        return apiResponse.successResponse(res, "No Stock found");
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Total stocks
 */

exports.AllProducts = [
  auth,
  async (req, res) => {
    try {
      let response = await allProducts();
      let data = [];
      for (const item of response) {
        let stock = await getStockBuySell(item.id);
        let aData = {};
        aData["_id"] = item.id;
        aData["item_name"] = item.item_name;
        aData["image"] = item.image;
        aData["totalPurchase"] = stock.buy;
        aData["totalSold"] = stock.sell;
        aData["currentStock"] = stock.buy - stock.sell;
        data.push(aData);
      }
      return apiResponse.successResponseWithData(
        res,
        "Total Stock Fetch",
        data
      );
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  },
];

exports.AllProductsMovement = [
  auth,
  async (req, res) => {
    try {
      let response = await allProducts();
      if (response.length > 0) {
        let products = [];
        for (var prod of response) {
          let prod_data = {};
          prod_data["_id"] = prod.id;
          prod_data["item_name"] = prod.item_name;
          prod_data["items_available"] = prod.items_available;
          prod_data["image"] = prod.image;
          let stock = await getStockMovement(prod.id);
          let data = stock.map((s) => {
            let data1 = {};
            data1["date"] = s.date;
            data1["user"] = s.user;
            data1["order_id"] = s.order_id;
            data1["status"] = s.status;
            data1["quantity"] = s.quantity;
            return data1;
          });
          prod_data["stocks"] = data;
          products.push(prod_data);
        }
        return apiResponse.successResponseWithData(
          res,
          "Stock Fetch",
          products
        );
      } else {
        return apiResponse.successResponse(res, "No Stock found");
      }
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  },
];

exports.ProductStockAdj = [
  auth,
  body("items")
    .isLength({ min: 1 })
    .withMessage("Items cannot be empty")
    .isArray()
    .withMessage("Items must be Array of objects."),
  body("items.*.item_id", "Item_id must be a string").exists().isString(),
  body("items.*.quantity", "Quantity must be a number").exists().isInt(),
  body("items.*.status", "Status must be a number")
    .exists()
    .isIn([1, 2])
    .withMessage("Values should be either 1 or 2"),
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
        req.body.items.map(async (it) => {
          let stock = await stockAdj({
            date: moment().format("YYYY-MM-DD"),
            user: req.user._id,
            order_id: 0,
            item_id: it.item_id,
            quantity: it.quantity,
            status: it.status,
            transactionType: "By Adjustment",
          });
        });
        return apiResponse.successResponse(res, "Stocks Updated");
      }
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  },
];
