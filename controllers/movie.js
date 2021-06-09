const Movie = require('../models/movie');
const NotFoundError = require('../Errors/NotFoundError');
const RequestError = require('../Errors/RequestError');
const ForbiddenError = require('../Errors/ForbiddenError');

module.exports.getMovie = (req, res, next) => {
  console.log(req.user._id);
  Movie.find({ owner: req.user._id })
    .then((movie) => {
      res.send({ data: movie });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.createMovie = (req, res, next) => {
  const {
    country, director, duration, year, description,
    image, trailer, nameRU, nameEN, thumbnail, movieId,
  } = req.body;
  const owner = req.user._id;

  Movie.create({
    country, director, duration, year, description, image, trailer, nameRU, nameEN, thumbnail, movieId, owner,
  })
    .then((movie) => {
      res.send({
        country: movie.country,
        director: movie.director,
        duration: movie.duration,
        year: movie.year,
        description: movie.description,
        image: movie.image,
        trailer: movie.trailer,
        nameRU: movie.nameRU,
        nameEN: movie.nameEN,
        thumbnail: movie.thumbnail,
        movieId: movie.movieId,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new RequestError('Переданы некорректные данные при создании карточки.'));
        return;
      }
      next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId).select('+owner')
    .then((movie) => {
      if (movie) {
        if (movie.owner.toString() === req.user._id.toString()) {
          Movie.findByIdAndRemove(req.params.movieId)
            .then((movies) => {
              res.send({
                country: movies.country,
                director: movies.director,
                duration: movies.duration,
                year: movies.year,
                description: movies.description,
                image: movies.image,
                trailer: movies.trailer,
                nameRU: movies.nameRU,
                nameEN: movies.nameEN,
                thumbnail: movies.thumbnail,
                movieId: movies.movieId,
              });
            });
        } else {
          throw new ForbiddenError('Вы не можете удалить чужую карточку');
        }
      } else {
        throw new NotFoundError('Карточка с указанным _id не найдена.');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new RequestError('Переданы некорректные данные при удалении карточки.'));
        return;
      }
      next(err);
    });
};
