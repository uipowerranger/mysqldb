const knex = require("../helpers/db_connect");
const { productsBySubCategory } = require("./ProductService");

const validateStatePostcode = async ({ state_id, postcode }) => {
  return await knex("post_codes")
    .where({
      state: state_id,
      post_code: postcode,
    })
    .whereNot({ status: 3 });
};

const categoryByState = async (id) => {
  return await knex("category")
    .select(`id`, `category_name`, `image`, `order_number`)
    .where({ state_details: id })
    .whereNot({ status: 3 })
    .orderBy("order_number");
};

const subcategoryProducts = async (id) => {
  let data = await knex("sub_category")
    .select(`id`, `sub_category_name`, `status`, `category`)
    .where({ category: id })
    .whereNot({ status: 3 });
  let final_data = [];
  for (const element of data) {
    element.map_products = await productsBySubCategory(element.id);
    final_data.push(element);
  }
  return final_data;
};

module.exports = {
  validateStatePostcode,
  categoryByState,
  subcategoryProducts,
};
