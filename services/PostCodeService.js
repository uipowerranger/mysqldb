const knex = require("../helpers/db_connect");

const postcodeList = async () => {
  return await knex("post_codes")
    .join("states", "post_codes.state", "=", "states.id")
    .whereNot({
      "post_codes.status": 3,
    })
    .select(
      `post_codes.id`,
      `post_codes.post_code`,
      `post_codes.status`,
      `post_codes.state as state_id`,
      `states.state_name`
    );
};

const postcodeListbyId = async (id) => {
  return await knex("post_codes")
    .where({
      state: id,
    })
    .join("states", "post_codes.state", "=", "states.id")
    .whereNot({
      "post_codes.status": 3,
    })
    .select(
      `post_codes.id`,
      `post_codes.post_code`,
      `post_codes.status`,
      `post_codes.state as state_id`,
      `states.state_name`
    );
};

const postcodeStore = async ({ post_code, state, status = 1 }) => {
  let id = await knex("post_codes")
    .where({
      post_code: post_code,
    })
    .whereNot("status", 3)
    .select(`id`)
    .limit(1);
  if (id.length === 0) {
    let sid = await knex("states")
      .where({
        id: state,
      })
      .whereNot("status", 3)
      .select(`id`)
      .limit(1);
    if (sid.length === 1) {
      await knex("post_codes").insert({
        post_code,
        state,
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

const postcodeDelete = async (id) => {
  return await knex("post_codes")
    .where({
      id: id,
      status: 1,
    })
    .update({
      status: 3,
    });
};

const postcodeUpdate = async ({ post_code, state, status, id }) => {
  let sid = await knex("states")
    .where({
      id: state,
    })
    .whereNot("status", 3)
    .select(`id`)
    .limit(1);
  if (sid.length === 1) {
    await knex("post_codes").where({ id: id }).update({
      post_code,
      state,
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

module.exports = {
  postcodeList,
  postcodeListbyId,
  postcodeStore,
  postcodeDelete,
  postcodeUpdate,
};
