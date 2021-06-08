const routes = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { getMovie, createMovie, deleteMovie } = require('../controllers/movie');

routes.get('/', getMovie);
routes.post('/', celebrate({
  params: Joi.object().keys({
    _id: Joi.string().alphanum().length(24),
  }),
  body: Joi.object().keys({
    country: Joi.string(),
    director: Joi.string(),
    duration: Joi.number(),
    year: Joi.string(),
    description: Joi.string(),
    image: Joi.string(),
    trailer: Joi.string(),
    thumbnail: Joi.string(),
    nameRU: Joi.string(),
    nameEN: Joi.string(),
  }),
}), createMovie);
routes.delete('/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().alphanum().length(24),
  }),
}), deleteMovie);

module.exports = routes;
