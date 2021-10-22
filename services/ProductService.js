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

const getStock = async (id) => {
  let buy = await knex("stock_movement")
    .sum(`quantity as buy_quantity`)
    .where({ item_id: id, status: 1 });
  let sell = await knex("stock_movement")
    .sum(`quantity as sell_quantity`)
    .where({ item_id: id, status: 2 });
  return Number(buy[0].buy_quantity) - Number(sell[0].sell_quantity);
};

const allProducts = async () => {
  let data = await knex("products")
    .join("states", "products.state_details", "=", "states.id")
    .join("category", "products.category_details", "=", "category.id")
    .join(
      "sub_category",
      "products.sub_category_details",
      "=",
      "sub_category.id"
    )
    .join("post_codes", "products.post_code_details", "=", "post_codes.id")
    .select(
      `products.id`,
      `products.offer_from_date`,
      `products.offer_to_date`,
      `products.price`,
      `products.actualPrice`,
      `products.weight`,
      `products.category_details as category_id`,
      `products.sub_category_details as sub_category_id`,
      `products.state_details as state_id`,
      `products.post_code_details as post_code_id`,
      `products.deal_details`,
      `products.image`,
      `products.offer_details`,
      `products.has_deal`,
      `products.has_offer`,
      `products.home_page_display`,
      `products.item_name`,
      `products.user`,
      `products.status`,
      `products.homepage_filter`,
      `products.description`,
      `products.units`,
      `category.category_name`,
      `post_codes.post_code`,
      `sub_category.sub_category_name`,
      `states.state_name`
    )
    .whereNot({ "products.status": 3 });
  let final_data = [];
  for (const element of data) {
    element.items_available = await getStock(element.id);
    final_data.push(element);
  }
  return final_data;
};

const productsBySubCategory = async (id) => {
  let data = await knex("products")
    .join("states", "products.state_details", "=", "states.id")
    .join("category", "products.category_details", "=", "category.id")
    .join(
      "sub_category",
      "products.sub_category_details",
      "=",
      "sub_category.id"
    )
    .join("post_codes", "products.post_code_details", "=", "post_codes.id")
    .select(
      `products.id`,
      `products.offer_from_date`,
      `products.offer_to_date`,
      `products.price`,
      `products.actualPrice`,
      `products.weight`,
      `products.category_details as category_id`,
      `products.sub_category_details as sub_category_id`,
      `products.state_details as state_id`,
      `products.post_code_details as post_code_id`,
      `products.deal_details`,
      `products.image`,
      `products.offer_details`,
      `products.has_deal`,
      `products.has_offer`,
      `products.home_page_display`,
      `products.item_name`,
      `products.user`,
      `products.status`,
      `products.homepage_filter`,
      `products.description`,
      `products.units`,
      `category.category_name`,
      `post_codes.post_code`,
      `sub_category.sub_category_name`,
      `states.state_name`
    )
    .where({ sub_category_details: id })
    .whereNot({ "products.status": 3 });
  let final_data = [];
  for (const element of data) {
    element.items_available = await getStock(element.id);
    final_data.push(element);
  }
  return final_data;
};

const productsByCategory = async (id) => {
  let data = await knex("products")
    .join("states", "products.state_details", "=", "states.id")
    .join("category", "products.category_details", "=", "category.id")
    .join(
      "sub_category",
      "products.sub_category_details",
      "=",
      "sub_category.id"
    )
    .join("post_codes", "products.post_code_details", "=", "post_codes.id")
    .select(
      `products.id`,
      `products.offer_from_date`,
      `products.offer_to_date`,
      `products.price`,
      `products.actualPrice`,
      `products.weight`,
      `products.category_details as category_id`,
      `products.sub_category_details as sub_category_id`,
      `products.state_details as state_id`,
      `products.post_code_details as post_code_id`,
      `products.deal_details`,
      `products.image`,
      `products.offer_details`,
      `products.has_deal`,
      `products.has_offer`,
      `products.home_page_display`,
      `products.item_name`,
      `products.user`,
      `products.status`,
      `products.homepage_filter`,
      `products.description`,
      `products.units`,
      `category.category_name`,
      `post_codes.post_code`,
      `sub_category.sub_category_name`,
      `states.state_name`
    )
    .where({ category_details: id })
    .whereNot({ "products.status": 3 });
  let final_data = [];
  for (const element of data) {
    element.items_available = await getStock(element.id);
    final_data.push(element);
  }
  return final_data;
};

const productsByState = async (id) => {
  let data = await knex("products")
    .join("states", "products.state_details", "=", "states.id")
    .join("category", "products.category_details", "=", "category.id")
    .join(
      "sub_category",
      "products.sub_category_details",
      "=",
      "sub_category.id"
    )
    .join("post_codes", "products.post_code_details", "=", "post_codes.id")
    .select(
      `products.id`,
      `products.offer_from_date`,
      `products.offer_to_date`,
      `products.price`,
      `products.actualPrice`,
      `products.weight`,
      `products.category_details as category_id`,
      `products.sub_category_details as sub_category_id`,
      `products.state_details as state_id`,
      `products.post_code_details as post_code_id`,
      `products.deal_details`,
      `products.image`,
      `products.offer_details`,
      `products.has_deal`,
      `products.has_offer`,
      `products.home_page_display`,
      `products.item_name`,
      `products.user`,
      `products.status`,
      `products.homepage_filter`,
      `products.description`,
      `products.units`,
      `category.category_name`,
      `post_codes.post_code`,
      `sub_category.sub_category_name`,
      `states.state_name`
    )
    .where({ "products.state_details": id })
    .whereNot({ "products.status": 3 });
  let final_data = [];
  for (const element of data) {
    element.items_available = await getStock(element.id);
    final_data.push(element);
  }
  return final_data;
};

const productSearchByState = async ({ state_id, search_string }) => {
  let data = await knex("products")
    .join("states", "products.state_details", "=", "states.id")
    .join("category", "products.category_details", "=", "category.id")
    .join(
      "sub_category",
      "products.sub_category_details",
      "=",
      "sub_category.id"
    )
    .join("post_codes", "products.post_code_details", "=", "post_codes.id")
    .select(
      `products.id`,
      `products.offer_from_date`,
      `products.offer_to_date`,
      `products.price`,
      `products.actualPrice`,
      `products.weight`,
      `products.category_details as category_id`,
      `products.sub_category_details as sub_category_id`,
      `products.state_details as state_id`,
      `products.post_code_details as post_code_id`,
      `products.deal_details`,
      `products.image`,
      `products.offer_details`,
      `products.has_deal`,
      `products.has_offer`,
      `products.home_page_display`,
      `products.item_name`,
      `products.user`,
      `products.status`,
      `products.homepage_filter`,
      `products.description`,
      `products.units`,
      `category.category_name`,
      `post_codes.post_code`,
      `sub_category.sub_category_name`,
      `states.state_name`
    )
    .where({
      "products.state_details": state_id,
    })
    .where("products.item_name", "like", `%${search_string}%`)
    .whereNot({ "products.status": 3 });
  let final_data = [];
  for (const element of data) {
    element.items_available = await getStock(element.id);
    final_data.push(element);
  }
  return final_data;
};

const productsByStateCategory = async ({ state_id, category_id }) => {
  let data = await knex("products")
    .join("states", "products.state_details", "=", "states.id")
    .join("category", "products.category_details", "=", "category.id")
    .join(
      "sub_category",
      "products.sub_category_details",
      "=",
      "sub_category.id"
    )
    .join("post_codes", "products.post_code_details", "=", "post_codes.id")
    .select(
      `products.id`,
      `products.offer_from_date`,
      `products.offer_to_date`,
      `products.price`,
      `products.actualPrice`,
      `products.weight`,
      `products.category_details as category_id`,
      `products.sub_category_details as sub_category_id`,
      `products.state_details as state_id`,
      `products.post_code_details as post_code_id`,
      `products.deal_details`,
      `products.image`,
      `products.offer_details`,
      `products.has_deal`,
      `products.has_offer`,
      `products.home_page_display`,
      `products.item_name`,
      `products.user`,
      `products.status`,
      `products.homepage_filter`,
      `products.description`,
      `products.units`,
      `category.category_name`,
      `post_codes.post_code`,
      `sub_category.sub_category_name`,
      `states.state_name`
    )
    .where({
      "products.state_details": state_id,
      "products.category_details": category_id,
    })
    .whereNot({ "products.status": 3 });
  let final_data = [];
  for (const element of data) {
    element.items_available = await getStock(element.id);
    final_data.push(element);
  }
  return final_data;
};

const allProductsList = async () => {
  let data = await knex("products")
    .join("states", "products.state_details", "=", "states.id")
    .join("category", "products.category_details", "=", "category.id")
    .join(
      "sub_category",
      "products.sub_category_details",
      "=",
      "sub_category.id"
    )
    .join("post_codes", "products.post_code_details", "=", "post_codes.id")
    .select(
      `products.id`,
      `products.offer_from_date`,
      `products.offer_to_date`,
      `products.price`,
      `products.actualPrice`,
      `products.weight`,
      `products.category_details as category_id`,
      `products.sub_category_details as sub_category_id`,
      `products.state_details as state_id`,
      `products.post_code_details as post_code_id`,
      `products.deal_details`,
      `products.image`,
      `products.offer_details`,
      `products.has_deal`,
      `products.has_offer`,
      `products.home_page_display`,
      `products.item_name`,
      `products.user`,
      `products.status`,
      `products.homepage_filter`,
      `products.description`,
      `products.units`,
      `category.category_name`,
      `post_codes.post_code`,
      `sub_category.sub_category_name`,
      `states.state_name`
    )
    .whereNot({ "products.status": 3 });
  let final_data = [];
  let filters = await knex("filters")
    .select(`filter_name`)
    .whereNot({ status: 3 });
  let filterList = filters.map((p) => {
    return {
      name: p.filter_name,
      prod_list: [],
    };
  });
  for (const element of data) {
    element.items_available = await getStock(element.id);
    final_data.push(element);
  }
  final_data.map((prod) => {
    let i = filterList.findIndex((f) => f.name === prod.homepage_filter);
    let fIndex = i;
    if (fIndex !== -1) {
      filterList[fIndex].prod_list.push(prod);
    }
    return prod;
  });
  return filterList.filter((d) => d.prod_list.length > 0);
};

const productById = async (id) => {
  let data = await knex("products")
    .join("states", "products.state_details", "=", "states.id")
    .join("category", "products.category_details", "=", "category.id")
    .join(
      "sub_category",
      "products.sub_category_details",
      "=",
      "sub_category.id"
    )
    .join("post_codes", "products.post_code_details", "=", "post_codes.id")
    .select(
      `products.id`,
      `products.offer_from_date`,
      `products.offer_to_date`,
      `products.price`,
      `products.actualPrice`,
      `products.weight`,
      `products.category_details as category_id`,
      `products.sub_category_details as sub_category_id`,
      `products.state_details as state_id`,
      `products.post_code_details as post_code_id`,
      `products.deal_details`,
      `products.image`,
      `products.offer_details`,
      `products.has_deal`,
      `products.has_offer`,
      `products.home_page_display`,
      `products.item_name`,
      `products.user`,
      `products.status`,
      `products.homepage_filter`,
      `products.description`,
      `products.units`,
      `category.category_name`,
      `post_codes.post_code`,
      `sub_category.sub_category_name`,
      `states.state_name`
    )
    .where({ "products.id": id });
  let final_data = [];
  for (const element of data) {
    element.items_available = await getStock(element.id);
    final_data.push(element);
  }
  return final_data;
};

const getStockBuySell = async (id) => {
  let buy = await knex("stock_movement")
    .sum(`quantity as buy_quantity`)
    .where({ item_id: id, status: 1 });
  let sell = await knex("stock_movement")
    .sum(`quantity as sell_quantity`)
    .where({ item_id: id, status: 2 });
  return {
    buy: !!buy[0].buy_quantity ? buy[0].buy_quantity : 0,
    sell: !!sell[0].sell_quantity ? sell[0].sell_quantity : 0,
  };
};

const getStockMovement = async (id) => {
  return await knex("stock_movement")
    .select(
      `id`,
      `user`,
      `order_id`,
      `item_id`,
      `quantity`,
      `status`,
      `transactionType`
    )
    .select(knex.raw("DATE_FORMAT(date, '%m-%d-%Y') as date"))
    .where({ item_id: id });
};

const stockAdj = async ({
  date,
  user,
  order_id,
  item_id,
  quantity,
  status,
  transactionType,
}) => {
  return await knex("stock_movement").insert({
    date,
    user,
    order_id,
    item_id,
    quantity,
    status,
    transactionType,
  });
};

module.exports = {
  productStore,
  productUpdate,
  productDelete,
  allProducts,
  stockAdj,
  getStockMovement,
  productsByState,
  allProductsList,
  productSearchByState,
  productsByCategory,
  productsBySubCategory,
  productsByStateCategory,
  productById,
  getStockBuySell,
};
