const knex = require("../helpers/db_connect");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");

const createOrder = async (request) => {
  const {
    total_amount,
    first_name,
    last_name,
    email_id,
    phone_number,
    alternate_phone = "",
    mailing_address: { address1, address2 = "", city, state, postcode },
    shipping_address: {
      address1: saddress1,
      address2: saddress2 = "",
      city: scity,
      state: sstate,
      postcode: spostcode,
    },
    state_details,
    redeempoints_used = 0,
    delivery_charges = 0,
    user,
    items,
    order_date,
  } = request;
  let order_uuid = uuidv4();
  let oid = await knex("orders").insert({
    user,
    order_uuid: order_uuid,
    order_date,
    status: 1,
    total_amount,
    delivery_charges,
    first_name,
    last_name,
    email_id,
    phone_number,
    alternate_phone,
    mailing_address_address1: address1,
    mailing_address_address2: address2,
    mailing_address_city: city,
    mailing_address_state: state,
    mailing_address_postcode: postcode,
    shipping_address_address1: saddress1,
    shipping_address_address2: saddress2,
    shipping_address_city: scity,
    shipping_address_state: sstate,
    shipping_address_postcode: spostcode,
    payment: 0,
    order_completed: 0,
    state_details,
    redeempoints_used,
  });
  items.map(async (item) => {
    await knex("orders_items").insert({
      order_id: oid[0],
      order_uuid: order_uuid,
      item_id: item.item_id,
      item_name: item.item_name,
      item_image: item.item_image,
      quantity: item.quantity,
      price: item.price,
      amount: item.amount,
      status: 1,
    });
  });
  return {
    order_id: order_uuid,
    order_date: order_date,
  };
};

const getOrderById = async (id) => {
  return knex("orders")
    .where({
      order_uuid: id,
    })
    .select();
};

const updatePayment = async (id, status) => {
  return knex("orders")
    .where({
      order_uuid: id,
    })
    .update({
      payment: status,
    });
};

module.exports = {
  createOrder,
  getOrderById,
  updatePayment,
};
