const routes = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { getUser, updateProfile } = require('../controllers/users');

routes.get('/me', getUser);
routes.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string(),
  }),
}), updateProfile);

module.exports = routes;
