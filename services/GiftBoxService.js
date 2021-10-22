const knex = require("../helpers/db_connect");
const moment = require("moment");

const create = async ({
  box_name,
  status,
  user,
  total_amount,
  items_allowed,
  items,
}) => {
  let id = await knex("gift_box").insert({
    box_name,
    status,
    user,
    total_amount,
    items_allowed,
  });
  for (var item of items) {
    await knex("gift_box_items").insert({
      gift_box_id: id[0],
      item_id: item.item_id,
      item_name: item.item_name,
      image: item.item_image,
      quantity: item.quantity,
      price: item.price,
      amount: item.amount,
      status: 1,
    });
  }
  return id;
};

const getGiftItems = async (id) => {
  return await knex("gift_box_items").select().where({
    gift_box_id: id,
    status: 1,
  });
};

const list = async () => {
  let data = await knex("gift_box").select().whereNot({
    status: 3,
  });
  let final_data = [];
  for (const element of data) {
    element.items = await getGiftItems(element.id);
    final_data.push(element);
  }
  return final_data;
};

const giftDelete = async (id) => {
  let did = await knex("gift_box").update({ status: 3 }).where({
    id: id,
  });
  await knex("gift_box_items").update({ status: 3 }).where({
    gift_box_id: id,
  });
  return did;
};

const update = async ({
  box_name,
  status,
  user,
  total_amount,
  items_allowed,
  items,
  id,
}) => {
  let uid = await knex("gift_box")
    .update({
      box_name,
      status,
      user,
      total_amount,
      items_allowed,
    })
    .where({ id: id });
  await knex("gift_box_items").update({ status: 2 }).where({ gift_box_id: id });
  for (var item of items) {
    await knex("gift_box_items").insert({
      gift_box_id: id,
      item_id: item.item_id,
      item_name: item.item_name,
      image: item.item_image,
      quantity: item.quantity,
      price: item.price,
      amount: item.amount,
      status: 1,
    });
  }
  return id;
};

module.exports = {
  create,
  list,
  giftDelete,
  update,
};
