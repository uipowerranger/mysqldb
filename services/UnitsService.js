const knex = require("../helpers/db_connect");

const existName = async ({ unit_name }) => {
  return await knex("units")
    .where({
      unit_name: unit_name,
    })
    .whereNot({ status: 3 })
    .count("id as count");
};

const unitsStore = async ({ unit_name, status = 1 }) => {
  let ec = await existName({ unit_name });
  if (ec[0].count === 0) {
    let i = await knex("units").insert({
      unit_name,
      status,
    });
    if (i) {
      return {
        status: 200,
        message: "Unit name saved",
      };
    } else {
      return {
        status: 500,
        message: "Unit name save failed",
      };
    }
  } else {
    return {
      status: 500,
      message: "Unit name already exists",
    };
  }
};

const unitsList = async () => {
  return await knex("units")
    .select("units.id", "units.unit_name", "units.status")
    .whereNot({
      "units.status": 3,
    });
};

const unitsDelete = async (id) => {
  return await knex("units")
    .update({
      status: 3,
    })
    .where({
      id: id,
    });
};

const unitsUpdate = async ({ unit_name, status, id }) => {
  let i = await knex("units")
    .update({
      unit_name,
      status,
    })
    .where({ id: id });
  if (i) {
    return {
      status: 200,
      message: "Unit name Updated",
    };
  } else {
    return {
      status: 500,
      message: "Unit name update failed",
    };
  }
};

module.exports = {
  unitsStore,
  unitsList,
  unitsDelete,
  unitsUpdate,
};
