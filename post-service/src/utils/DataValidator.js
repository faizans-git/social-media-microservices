const joi = require("joi");

const validateCreatePost = (data) => {
  const schema = joi.object({
    content: joi.string().min(3).max(50).required(),
  });

  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = joi.object({
    email: joi.string().email().required(),
    mediaId: joi.string().min(8).required(),
  });
  return schema.validate(data);
};

module.exports = { validateCreatePost, validateLogin };
