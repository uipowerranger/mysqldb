var express = require("express");
const model = {
  user: { type: "Number", ref: "users", required: true },
  item_id: { type: "Number", ref: "products", required: true },
  quantity: { type: "Number", required: true, default: 1 },
  price: { type: "Number", required: true, default: 1 },
  amount: { type: "Number", required: true, default: 1 },
  added_date: { type: "Date", required: true, default: new Date() },
  status: { type: "Number", required: true, default: 1 },
};

var router = express.Router();

router.get("/", (req, res) => {
  var sql = `CREATE TABLE wishlist (
        id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,`;
  let col = Object.keys(model).map((key) => {
    var type =
      model[key].type === "String"
        ? `VARCHAR(255)`
        : model[key].type === "Date"
        ? `DATE`
        : `INT(11)`;
    return key + ` ${type} NULL,`;
  });
  sql = sql + col.join(" ");
  sql =
    sql +
    `createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) `;
  res.send(sql);
});

module.exports = router;
