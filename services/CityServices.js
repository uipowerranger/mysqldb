const knex = require("../helpers/db_connect");

const cityStore = async ({ city_name, state_id, status = 1 }) => {
  console.log(city_name, state_id, status);
  let id = await knex("cities")
    .where({
      city_name: city_name,
    })
    .whereNot("status", 3)
    .select(`id`)
    .limit(1);
  if (id.length === 0) {
    let sid = await knex("states")
      .where({
        id: state_id,
      })
      .whereNot("status", 3)
      .select(`id`)
      .limit(1);
    if (sid.length === 1) {
      await knex("cities").insert({
        city_name,
        state: state_id,
        status,
      });
      return {
        status: 200,
      };
    } else {
      return {
        status: 400,
      };
    }
  } else {
    return {
      status: 500,
    };
  }
};

const cityList = async (id) => {
  return await knex("cities")
    .join("states", "cities.state", "=", "states.id")
    .whereNot({
      "cities.status": 3,
    })
    .where({
      state: id,
    })
    .select(
      `cities.id`,
      `cities.city_name`,
      `cities.status`,
      `cities.state as state_id`,
      `states.state_name`
    );
};

const cityDelete = async (id) => {};

module.exports = {
  cityList,
  cityStore,
};
