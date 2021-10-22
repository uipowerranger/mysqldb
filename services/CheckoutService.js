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
  checkout_date,
  _id = null,
}) => {
  let existId = await knex("checkout").select("id").where({
    user: user,
    item_id: item_id,
  });
  if (!!_id) {
    await knex("wishlist").update({ status: 3 }).where({ id: _id });
  }
  if (existId.length > 0) {
    return await knex("checkout")
      .update({
        item_id,
        quantity,
        price,
        amount,
        status,
        user,
        checkout_date,
      })
      .where({
        id: existId[0].id,
      });
  } else {
    return await knex("checkout").insert({
      item_id,
      quantity,
      price,
      amount,
      status,
      user,
      checkout_date,
    });
  }
};

const list = async (id) => {
  let data = await knex("checkout")
    .select(`id`, `user`, `item_id`, `quantity`, `price`, `amount`, `status`)
    .select(knex.raw("DATE_FORMAT(checkout_date, '%m-%d-%Y') as checkout_date"))
    .where({
      user: id,
      status: 1,
    });
  let checkout = [];
  for (var item of data) {
    let prod = await productById(item.item_id);
    if (prod.length > 0) {
      item["item_name"] = prod[0].item_name;
      item["image"] = prod[0].image;
      item["items_available"] = prod[0].items_available;
      checkout.push(item);
    }
  }
  return checkout;
};

const checkDelete = async (id) => {
  return await knex("checkout")
    .update({
      status: 3,
    })
    .where({
      id: id,
    });
};

const checkDeleteAll = async (id) => {
  return await knex("checkout")
    .update({
      status: 3,
    })
    .where({
      user: id,
    });
};

const update = async ({
  item_id,
  quantity,
  price,
  amount,
  status,
  user,
  checkout_date,
  id,
}) => {
  return await knex("checkout")
    .update({
      item_id,
      quantity,
      price,
      amount,
      status,
      user,
      checkout_date,
    })
    .where({
      id: id,
    });
};

module.exports = {
  create,
  list,
  checkDelete,
  checkDeleteAll,
  update,
};
