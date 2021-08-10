const knex = require("../helpers/db_connect");

const validateCategory = async ({ category }) => {
  return await knex("category")
    .where({
      id: category,
    })
    .whereNot({ status: 3 })
    .count("id as count");
};

const existCategory = async ({ sub_category_name }) => {
  return await knex("sub_category")
    .where({
      sub_category_name: sub_category_name,
    })
    .whereNot({ status: 3 })
    .count("id as count");
};

const categoryStore = async ({ sub_category_name, category, status = 1 }) => {
  let vc = await validateCategory({ category });
  let ec = await existCategory({ sub_category_name });
  if (vc[0].count === 0) {
    return {
      status: 500,
      message: "Category id not exists",
    };
  } else if (ec[0].count === 0) {
    let i = await knex("sub_category").insert({
      sub_category_name,
      category,
      status,
    });
    if (i) {
      return {
        status: 200,
        message: "Sub Category saved",
      };
    } else {
      return {
        status: 500,
        message: "Sub Category save failed",
      };
    }
  } else {
    return {
      status: 500,
      message: "Category name already exists",
    };
  }
};

const categoryList = async () => {
  return await knex("sub_category")
    .join("category", "category.id", "=", "sub_category.category")
    .select(
      "sub_category.id",
      "sub_category.sub_category_name",
      "sub_category.status",
      "sub_category.category as category_id",
      "category.category_name"
    )
    .whereNot({
      "sub_category.status": 3,
    });
};

const categoryListById = async (id) => {
  return await knex("sub_category")
    .join("category", "category.id", "=", "sub_category.category")
    .select(
      "sub_category.id",
      "sub_category.sub_category_name",
      "sub_category.status",
      "sub_category.category as category_id",
      "category.category_name"
    )
    .where({
      category: id,
    })
    .whereNot({
      "sub_category.status": 3,
    });
};

const categoryDelete = async (id) => {
  return await knex("sub_category")
    .update({
      status: 3,
    })
    .where({
      id: id,
    });
};

const categoryUpdate = async ({ sub_category_name, category, status, id }) => {
  let vc = await validateCategory({ category });
  if (vc[0].count === 0) {
    return {
      status: 500,
      message: "Category id not exists",
    };
  } else {
    let i = await knex("sub_category")
      .update({
        sub_category_name,
        category,
        status,
      })
      .where({ id: id });
    if (i) {
      return {
        status: 200,
        message: "Sub Category Updated",
      };
    } else {
      return {
        status: 500,
        message: "Sub Category update failed",
      };
    }
  }
};

module.exports = {
  categoryStore,
  categoryList,
  categoryListById,
  categoryDelete,
  categoryUpdate,
};
