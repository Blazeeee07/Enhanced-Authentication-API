const Joi = require("joi");

const INVALID_PHONE_NUMBER = "invalid phone number";

const UserSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(2).required(),
  name: Joi.string(),
  bio: Joi.string(),
  phone: Joi.string()
      .length(10)
      .pattern(/^[6-9]\d{9}$/)
      .messages({
        "string.base": INVALID_PHONE_NUMBER,
        "string.empty": INVALID_PHONE_NUMBER,
        "string.min": INVALID_PHONE_NUMBER,
        "any.required": INVALID_PHONE_NUMBER,
        "string.pattern.base": INVALID_PHONE_NUMBER,
      }),
    isAdmin:Joi.boolean(),
    isPublic: Joi.boolean(),
    photoURL: Joi.string(),
})

module.exports = {
  UserSchema,
}