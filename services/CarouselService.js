const knex = require("../helpers/db_connect");

const validateCategory = async ({ category }) => {
  return await knex("category")
    .where({
      id: category,
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

const carouselStore = async ({
  description,
  image,
  state,
  category,
  status = 1,
}) => {
  let c = await validateCategory({ category });
  let s = await validateState({ state });
  if (c[0].count > 0 && s[0].count > 0) {
    let i = await knex("carousel").insert({
      description,
      image,
      state,
      category,
      status,
    });
    if (i) {
      return {
        status: 200,
        message: "Carousel saved",
      };
    } else {
      return {
        status: 500,
        message: "Carousel save failed",
      };
    }
  } else {
    return {
      status: 500,
      message: "Category or State not exists",
    };
  }
};

const carouselList = async () => {
  return await knex("carousel")
    .join("states", "carousel.state", "=", "states.id")
    .join("category", "carousel.category", "=", "category.id")
    .select(
      "carousel.id",
      "carousel.description",
      "carousel.image",
      "carousel.state as state_id",
      "carousel.category as category_id",
      "carousel.status",
      "states.state_name",
      "category.category_name"
    )
    .whereNot({
      "carousel.status": 3,
    });
};

const carouselDelete = async (id) => {
  return await knex("carousel")
    .update({
      status: 3,
    })
    .where({
      id: id,
    });
};

const carouselUpdate = async ({
  description,
  image,
  state,
  category,
  status,
  id,
}) => {
  let c = await validateCategory({ category });
  let s = await validateState({ state });
  if (c[0].count > 0 && s[0].count > 0) {
    let i = await knex("carousel")
      .update({
        description,
        image,
        state,
        category,
        status,
      })
      .where({ id: id });
    if (i) {
      return {
        status: 200,
        message: "Carousel Updated",
      };
    } else {
      return {
        status: 500,
        message: "Carousel update failed",
      };
    }
  } else {
    return {
      status: 500,
      message: "Category or State not exists",
    };
  }
};

module.exports = {
  carouselStore,
  carouselList,
  carouselDelete,
  carouselUpdate,
};
