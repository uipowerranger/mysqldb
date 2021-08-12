const knex = require("../helpers/db_connect");
const moment = require("moment");

const validateCategory = async ({ category }) => {
  return await knex("category")
    .where({
      id: category,
    })
    .whereNot({ status: 3 })
    .count("id as count");
};

const validateSubCategory = async ({ sub_category }) => {
  return await knex("sub_category")
    .where({
      id: sub_category,
    })
    .whereNot({ status: 3 })
    .count("id as count");
};

const validateState = async ({ state }) => {
  return await knex("states")
    .where({
      id: state,
    })
    .whereNot({ status: 3 })
    .count("id as count");
};

const validatePostCode = async ({ post_code }) => {
  return await knex("post_codes")
    .where({
      id: post_code,
    })
    .whereNot({ status: 3 })
    .count("id as count");
};

const productStore = async ({
  offer_from_date = null,
  offer_to_date = null,
  items_available,
  price,
  actualPrice,
  weight,
  category_details,
  sub_category_details,
  state_details,
  post_code_details,
  deal_details = "",
  image = "",
  offer_details = "",
  has_deal = 0,
  has_offer = 0,
  home_page_display = 1,
  item_name,
  user,
  homepage_filter = "",
  description = "",
  units,
  status = 1,
}) => {
  let vc = await validateCategory({ category: category_details });
  let vsc = await validateSubCategory({ sub_category: sub_category_details });
  let vs = await validateState({ state: state_details });
  let vp = await validatePostCode({ post_code: post_code_details });
  if (
    vc[0].count > 0 &&
    vsc[0].count > 0 &&
    vs[0].count > 0 &&
    vp[0].count > 0
  ) {
    let id = await knex("products").insert({
      offer_from_date,
      offer_to_date,
      items_available,
      price,
      actualPrice,
      weight,
      category_details,
      sub_category_details,
      state_details,
      post_code_details,
      deal_details,
      image,
      offer_details,
      has_deal,
      has_offer,
      home_page_display,
      item_name,
      user,
      homepage_filter,
      description,
      units,
      status,
    });
    if (id) {
      await knex("stock_movement").insert({
        date: moment().format("YYYY-MM-DD"),
        user,
        order_id: 0,
        item_id: id[0],
        quantity: items_available,
        status: 1,
        transactionType: "By Create",
      });
      return {
        status: 200,
        message: "Product saved successfully",
        item_id: id[0],
      };
    } else {
      return {
        status: 500,
        message: "Product saved failed",
      };
    }
  } else {
    return {
      status: 500,
      message: "State or Postcode or Category or Sub Category not exists",
    };
  }
};

const productUpdate = async ({
  offer_from_date = null,
  offer_to_date = null,
  items_available,
  price,
  actualPrice,
  weight,
  category_details,
  sub_category_details,
  state_details,
  post_code_details,
  deal_details = "",
  image = "",
  offer_details = "",
  has_deal = 0,
  has_offer = 0,
  home_page_display = 1,
  item_name,
  user,
  homepage_filter = "",
  description = "",
  units,
  status = 1,
  id,
}) => {
  let vc = await validateCategory({ category: category_details });
  let vsc = await validateSubCategory({ sub_category: sub_category_details });
  let vs = await validateState({ state: state_details });
  let vp = await validatePostCode({ post_code: post_code_details });
  if (
    vc[0].count > 0 &&
    vsc[0].count > 0 &&
    vs[0].count > 0 &&
    vp[0].count > 0
  ) {
    let u = await knex("products").where({ id: id }).update({
      offer_from_date,
      offer_to_date,
      items_available,
      price,
      actualPrice,
      weight,
      category_details,
      sub_category_details,
      state_details,
      post_code_details,
      deal_details,
      image,
      offer_details,
      has_deal,
      has_offer,
      home_page_display,
      item_name,
      user,
      homepage_filter,
      description,
      units,
      status,
    });
    if (u) {
      return {
        status: 200,
        message: "Product Updated successfully",
      };
    } else {
      return {
        status: 500,
        message: "Product updated Failed",
      };
    }
  } else {
    return {
      status: 500,
      message: "State or Postcode or Category or Sub Category not exists",
    };
  }
};

const productDelete = async ({ id, status }) => {
  return await knex("products")
    .update({
      status: status,
    })
    .where({ id: id });
};

const allProducts = async () => {
  return await knex("products").select();
};

module.exports = {
  productStore,
  productUpdate,
  productDelete,
  allProducts,
};
