const knex = require("../helpers/db_connect");
const moment = require("moment");
const { productById } = require("./ProductService");

const create = async ({
  item_id,
  quantity,
  price,
  amount,
  status,
  user,
  added_date,
}) => {
  let existId = await knex("wishlist").select("id").where({
    user: user,
    item_id: item_id,
  });
  if (existId.length > 0) {
    return await knex("wishlist")
      .update({
        item_id,
        quantity,
        price,
        amount,
        status,
        user,
        added_date,
      })
      .where({
        id: existId[0].id,
      });
  } else {
    return await knex("wishlist").insert({
      item_id,
      quantity,
      price,
      amount,
      status,
      user,
      added_date,
    });
  }
};

const list = async (id) => {
  let data = await knex("wishlist")
    .select(`id`, `user`, `item_id`, `quantity`, `price`, `amount`, `status`)
    .select(knex.raw("DATE_FORMAT(added_date, '%m-%d-%Y') as added_date"))
    .where({
      user: id,
      status: 1,
    });
  let wishList = [];
  for (var item of data) {
    let prod = await productById(item.item_id);
    if (prod.length > 0) {
      item["item_name"] = prod[0].item_name;
      item["image"] = prod[0].image;
      item["items_available"] = prod[0].items_available;
      wishList.push(item);
    }
  }
  return wishList;
};

const wishDelete = async (id) => {
  return await knex("wishlist")
    .update({
      status: 3,
    })
    .where({
      id: id,
    });
};

module.exports = {
  create,
  list,
  wishDelete,
};
