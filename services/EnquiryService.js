const knex = require("../helpers/db_connect");
const moment = require("moment");

const store = async ({
  first_name,
  last_name,
  email_id,
  phone_number,
  post_code,
  status = 1,
  user = 1,
  enquiry_date = moment().format("yyyy-MM-DD"),
}) => {
  return await knex("enquiry").insert({
    first_name,
    last_name,
    email_id,
    phone_number,
    post_code,
    status,
    user,
    enquiry_date,
  });
};

const list = async () => {
  return await knex("enquiry")
    .select(
      `id`,
      `status`,
      `email_id`,
      `phone_number`,
      `first_name`,
      `last_name`,
      `post_code`
    )
    .select(knex.raw("DATE_FORMAT(enquiry_date, '%m-%d-%Y') as enquiry_date"));
};

module.exports = {
  store,
  list,
};
