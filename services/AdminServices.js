const knex = require("../helpers/db_connect");

const adminList = async () => {
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
      `designation`,
      `address`,
      `city`,
      `state`,
      `post_code`,
      `role`,
      `assign_state`,
      `createdAt`,
      `updatedAt`
    )
    .from("admin");
};

const login = async (email) => {
  return await knex("admin")
    .where({
      email_id: email,
    })
    .select(
      `id`,
      `first_name`,
      `last_name`,
      `email_id`,
      `password`,
      `role`,
      `assign_state`,
      `image`,
      `isConfirmed`,
      `is_active`,
      `status`
    );
};

const updateOtp = async ({ otp, id }) => {
  return await knex("admin")
    .where({
      id: id,
    })
    .update({
      confirmOTP: otp,
    });
};

const validateRegister = async ({ email_id, phone_number }) => {
  return await knex("admin")
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
  designation = "",
  address = "",
  state = "",
  city = "",
  post_code = "",
  assign_state = 0,
  role = "admin",
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
    await knex("admin").insert({
      first_name,
      last_name,
      email_id,
      password,
      phone_number,
      designation,
      address,
      state,
      city,
      post_code,
      assign_state,
      role,
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
  let resp = await knex("admin")
    .where({
      email_id: email_id,
      confirmOTP: otp,
    })
    .limit(1);
  if (resp.length > 0) {
    await knex("admin")
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

const adminGetByEmail = async ({ email_id }) => {
  return await knex("admin").where({
    email_id: email_id,
  });
};

const resetConfirm = async ({ otp, email_id, isConfirmed }) => {
  return await knex("admin")
    .update({
      isConfirmed: isConfirmed,
      confirmOTP: otp,
    })
    .where({
      email_id: email_id,
    });
};

const getAdminById = async (id) => {
  return await knex("admin")
    .where({
      "admin.id": id,
    })
    .join("states", "admin.assign_state", "=", "states.id")
    .select(
      `admin.id`,
      `first_name`,
      `last_name`,
      `email_id`,
      `password`,
      `isConfirmed`,
      `is_active`,
      `admin.status`,
      `phone_number`,
      `image`,
      `designation`,
      `address`,
      `city`,
      `state`,
      `post_code`,
      `role`,
      `assign_state`,
      `states.state_name`
    );
};

const updatePassword = async ({ password, id }) => {
  return await knex("admin")
    .update({
      password,
    })
    .where({ id });
};

const updateAdmin = async ({
  first_name,
  last_name = "",
  phone_number,
  designation = "",
  address = "",
  state = "",
  city = "",
  post_code = "",
  assign_state = 0,
  role = "admin",
  image = "",
  isConfirmed = 1,
  is_active = 1,
  confirmOTP = 123456,
  status = 1,
  id,
}) => {
  let v = await knex("admin")
    .update({
      first_name,
      last_name,
      phone_number,
      designation,
      address,
      state,
      city,
      post_code,
      assign_state,
      role,
      image,
      isConfirmed,
      is_active,
      confirmOTP,
      status,
    })
    .where({ id: id });
  if (v) {
    let admin_data = await knex("admin")
      .select(
        "id",
        "first_name",
        "last_name",
        "email_id",
        "role",
        "assign_state",
        "image"
      )
      .where({ id })
      .limit(1);
    return {
      status: 200,
      message: "Admin update Success",
      admin_data: admin_data[0],
    };
  } else {
    return { status: 500, message: "Admin update failed" };
  }
};

module.exports = {
  adminList,
  updateAdmin,
  login,
  updateOtp,
  register,
  verifyOtp,
  updatePassword,
  adminGetByEmail,
  resetConfirm,
  getAdminById,
};
