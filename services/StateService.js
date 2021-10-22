const knex = require("../helpers/db_connect");

const stateList = async () => {
  return await knex("states").whereNot({
    status: 3,
  });
};

const stateListbyId = async (id) => {
  return await knex("states")
    .where({
      id: id,
    })
    .select(`id`, `state_name`, `status`, `postcode_from`, `postcode_to`);
};

const stateStore = async ({
  state_name,
  postcode_from,
  postcode_to,
  status = 1,
}) => {
  let id = await knex("states")
    .where({
      state_name: state_name,
    })
    .whereNot("status", 3)
    .select(`id`)
    .limit(1);
  if (id.length === 0) {
    await knex("states").insert({
      state_name,
      postcode_from,
      postcode_to,
      status,
    });
    return {
      status: 200,
    };
  } else {
    return {
      status: 500,
    };
  }
};

const stateDelete = async (id) => {
  return await knex("states")
    .where({
      id: id,
      status: 1,
    })
    .update({
      status: 3,
    });
};

const stateUpdate = async ({
  state_name,
  postcode_from,
  postcode_to,
  status,
  id,
}) => {
  return await knex("states").where({ id: id }).update({
    state_name,
    postcode_from,
    postcode_to,
    status,
  });
};

module.exports = {
  stateList,
  stateListbyId,
  stateStore,
  stateDelete,
  stateUpdate,
};
