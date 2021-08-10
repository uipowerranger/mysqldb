const knex = require("../helpers/db_connect");

const existName = async ({ filter_name }) => {
  return await knex("filters")
    .where({
      filter_name: filter_name,
    })
    .whereNot({ status: 3 })
    .count("id as count");
};

const filtersStore = async ({ filter_name, status = 1 }) => {
  let ec = await existName({ filter_name });
  if (ec[0].count === 0) {
    let i = await knex("filters").insert({
      filter_name,
      status,
    });
    if (i) {
      return {
        status: 200,
        message: "Filter name saved",
      };
    } else {
      return {
        status: 500,
        message: "Filter name save failed",
      };
    }
  } else {
    return {
      status: 500,
      message: "Filter name already exists",
    };
  }
};

const filtersList = async () => {
  return await knex("filters")
    .select("filters.id", "filters.filter_name", "filters.status")
    .whereNot({
      "filters.status": 3,
    });
};

const filtersDelete = async (id) => {
  return await knex("filters")
    .update({
      status: 3,
    })
    .where({
      id: id,
    });
};

const filtersUpdate = async ({ filter_name, status, id }) => {
  let i = await knex("filters")
    .update({
      filter_name,
      status,
    })
    .where({ id: id });
  if (i) {
    return {
      status: 200,
      message: "Filter name Updated",
    };
  } else {
    return {
      status: 500,
      message: "Filter name update failed",
    };
  }
};

module.exports = {
  filtersStore,
  filtersList,
  filtersDelete,
  filtersUpdate,
};
