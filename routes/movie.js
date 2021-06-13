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
    image: Joi.string().uri(),
    trailer: Joi.string().uri(),
    thumbnail: Joi.string().uri(),
    nameRU: Joi.string(),
    nameEN: Joi.string(),
    movieId: Joi.number(),
  }),
}), createMovie);

routes.delete('/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().alphanum().length(24),
  }),
}), deleteMovie);

module.exports = routes;
