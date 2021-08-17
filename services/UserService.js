const knex = require("../helpers/db_connect");

const userList = async (id) => {
  return await knex
    .select(
      `id`,
      `first_name`,
      `last_name`,
      `email_id`,
      `isConfirmed`,
      `is_active`,
      `status`,
      `phone_number`,
      `image`,
      `address`,
      `city`,
      `state`,
      `post_code`,
      `createdAt`,
      `updatedAt`
    )
    .from("users")
    .whereNot({ id: id });
};

const login = async (email) => {
  return await knex("users")
    .where({
      email_id: email,
    })
    .select(
      `id`,
      `first_name`,
      `last_name`,
      `email_id`,
      `password`,
      `image`,
      `isConfirmed`,
      `is_active`,
      `status`
    );
};

const updateOtp = async ({ otp, id }) => {
  return await knex("users")
    .where({
      id: id,
    })
    .update({
      confirmOTP: otp,
    });
};

const validateRegister = async ({ email_id, phone_number }) => {
  return await knex("users")
    .orWhere({
      email_id: email_id,
    })
    .orWhere({
      phone_number: phone_number,
    })
    .count("id as count");
};

const register = async ({
  first_name,
  last_name,
  email_id,
  password,
  phone_number,
  address = "",
  state = "",
  city = "",
  post_code = "",
  image = "",
  isConfirmed = 0,
  is_active = 1,
  confirmOTP = 123456,
  status = 1,
}) => {
  let validate_Register = await validateRegister({ email_id, phone_number });
  if (validate_Register[0].count > 0) {
    return { status: 500, message: "Email id or Phone number already exists" };
  } else {
    await knex("users").insert({
      first_name,
      last_name,
      email_id,
      password,
      phone_number,
      address,
      state,
      city,
      post_code,
      image,
      isConfirmed,
      is_active,
      confirmOTP,
      status,
    });
    return { status: 200, message: "Register Success" };
  }
};

const verifyOtp = async ({ email_id, otp }) => {
  let resp = await knex("users")
    .where({
      email_id: email_id,
      confirmOTP: otp,
    })
    .limit(1);
  if (resp.length > 0) {
    await knex("users")
      .update({
        isConfirmed: 1,
        confirmOTP: 0,
      })
      .where({
        email_id: email_id,
      });
  }
  return resp;
};

const userGetByEmail = async ({ email_id }) => {
  return await knex("users").where({
    email_id: email_id,
  });
};

const resetConfirm = async ({ otp, email_id, isConfirmed }) => {
  return await knex("users")
    .update({
      isConfirmed: isConfirmed,
      confirmOTP: otp,
    })
    .where({
      email_id: email_id,
    });
};

const getUserById = async (id) => {
  return await knex("users")
    .where({
      "users.id": id,
    })
    .select(
      `users.id`,
      `first_name`,
      `last_name`,
      `email_id`,
      `password`,
      `isConfirmed`,
      `is_active`,
      `users.status`,
      `phone_number`,
      `image`,
      `address`,
      `city`,
      `state`,
      `post_code`
    );
};

const updatePassword = async ({ password, id }) => {
  return await knex("users")
    .update({
      password,
    })
    .where({ id });
};

const updateUser = async ({
  first_name,
  last_name = "",
  phone_number,
  address = "",
  state = "",
  city = "",
  post_code = "",
  image = "",
  isConfirmed = 1,
  is_active = 1,
  confirmOTP = 123456,
  status = 1,
  id,
}) => {
  let v = await knex("users")
    .update({
      first_name,
      last_name,
      phone_number,
      address,
      state,
      city,
      post_code,
      image,
      isConfirmed,
      is_active,
      confirmOTP,
      status,
    })
    .where({ id: id });
  if (v) {
    let admin_data = await knex("users")
      .select("id", "first_name", "last_name", "email_id", "image")
      .where({ id })
      .limit(1);
    return {
      status: 200,
      message: "User update Success",
      admin_data: admin_data[0],
    };
  } else {
    return { status: 500, message: "User update failed" };
  }
};

module.exports = {
  userList,
  updateUser,
  login,
  updateOtp,
  register,
  verifyOtp,
  updatePassword,
  userGetByEmail,
  resetConfirm,
  getUserById,
};
