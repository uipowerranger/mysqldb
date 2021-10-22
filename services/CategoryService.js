const knex = require("../helpers/db_connect");

const categoryList = async () => {
  return await knex("category")
    .join("states", "category.state_details", "=", "states.id")
    .join("post_codes", "category.post_code_details", "=", "post_codes.id")
    .whereNot({
      "category.status": 3,
    })
    .select(
      `category.id`,
      `category.category_name`,
      `category.status`,
      `category.order_number`,
      `category.state_details as state_id`,
      `category.post_code_details as post_code_id`,
      `states.state_name`,
      `post_codes.post_code`
    )
    .orderBy("order_number");
};

const categoryListByState = async (id) => {
  return await knex("category")
    .join("states", "category.state_details", "=", "states.id")
    .join("post_codes", "category.post_code_details", "=", "post_codes.id")
    .whereNot({
      "category.status": 3,
    })
    .where({
      state: id,
    })
    .select(
      `category.id`,
      `category.category_name`,
      `category.status`,
      `category.order_number`,
      `category.state_details as state_id`,
      `category.post_code_details as post_code_id`,
      `states.state_name`,
      `post_codes.post_code`
    )
    .orderBy("order_number");
};

const validateCategoryName = async ({ category_name }) => {
  return await knex("category")
    .where({
      category_name: category_name,
    })
    .whereNot({ status: 3 })
    .count("id as count");
};

const validateState = async ({ state_details }) => {
  return await knex("states")
    .where({
      id: state_details,
    })
    .whereNot({ status: 3 })
    .count("id as count");
};

const validatePostcode = async ({ post_code_details }) => {
  return await knex("post_codes")
    .where({
      id: post_code_details,
    })
    .whereNot({ status: 3 })
    .count("id as count");
};

const categoryStore = async ({
  category_name,
  state_details,
  order_number,
  post_code_details,
  image,
  status = 1,
}) => {
  let valid_category = await validateCategoryName({
    category_name,
  });
  let valid_state = await validateState({
    state_details,
  });
  let valid_postcode = await validatePostcode({
    post_code_details,
  });
  if (valid_category[0].count > 0) {
    return { status: 500, message: "Category name already exists" };
  } else if (valid_state[0].count === 0) {
    return { status: 500, message: "State id doesn't exists" };
  } else if (valid_postcode[0].count === 0) {
    return { status: 500, message: "Postcode id doesn't exists" };
  } else {
    await knex("category").insert({
      category_name,
      state_details,
      order_number,
      post_code_details,
      image,
      status,
    });
    return { status: 200, message: "Category saved" };
  }
};

const categoryUpdate = async ({
  category_name,
  state_details,
  order_number,
  post_code_details,
  image,
  status = 1,
  id,
}) => {
  let valid_category = await validateCategoryName({
    category_name,
  });
  let valid_state = await validateState({
    state_details,
  });
  let valid_postcode = await validatePostcode({
    post_code_details,
  });
  if (valid_category[0].count > 0) {
    return { status: 500, message: "Category name already exists" };
  } else if (valid_state[0].count === 0) {
    return { status: 500, message: "State id doesn't exists" };
  } else if (valid_postcode[0].count === 0) {
    return { status: 500, message: "Postcode id doesn't exists" };
  } else {
    let u = await knex("category")
      .update({
        category_name,
        state_details,
        order_number,
        post_code_details,
        image,
        status,
      })
      .where({
        id: id,
      });
    if (u) {
      return { status: 200, message: "Category Updated" };
    } else {
      return { status: 500, message: "Category Updated failed" };
    }
  }
};

const categoryDelete = async (id) => {
  return await knex("category").update({ status: 3 }).where({ id: id });
};

module.exports = {
  categoryList,
  categoryStore,
  categoryListByState,
  categoryDelete,
  categoryUpdate,
};
