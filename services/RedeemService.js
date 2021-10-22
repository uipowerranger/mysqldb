const knex = require("../helpers/db_connect");

const addRedeem = async ({
  date,
  user,
  order_id,
  total_amount,
  redeem_points,
  status,
}) => {
  return await knex("redeem").insert({
    date,
    user,
    order_id,
    total_amount,
    redeem_points,
    status,
  });
};

const getRedeem = async (id) => {
  return await knex("redeem")
    .select(
      `id`,
      `user`,
      `order_id`,
      `total_amount`,
      `redeem_points`,
      `status`,
      `createdAt`,
      `updatedAt`
    )
    .select(knex.raw("DATE_FORMAT(date, '%m-%d-%Y') as date"))
    .where({
      user: id,
    });
};

const totalRedeem = async (id) => {
  let earn = await knex("redeem")
    .sum(`redeem_points as earn`)
    .where({ user: id, status: 1 });
  let used = await knex("redeem")
    .sum(`redeem_points as used`)
    .where({ user: id, status: 2 });
  return {
    earn: !!earn[0].earn ? earn[0].earn : 0,
    used: !!used[0].used ? used[0].used : 0,
  };
};

module.exports = {
  getRedeem,
  totalRedeem,
  addRedeem,
};
