const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Users = require('../models/users');
const NotFoundError = require('../Errors/NotFoundError');
const EmailRepeatError = require('../Errors/EmailRepeatError');
const RequestError = require('../Errors/RequestError');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUser = (req, res, next) => {
  Users.findById(req.user._id)
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        throw new NotFoundError('Пользователь по указанному _id не найден.');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new RequestError('Переданы некорректные данные при получении данных пользователя.'));
        return;
      }

      next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  if (req.body.email === undefined || req.body.password === undefined) {
    throw new RequestError('Переданы некорректные данные при создании пользователя.');
  }
  bcrypt.hash(req.body.password, 10)
    .then((hash) => Users.create({
      name: req.body.name,
      about: req.body.about,
      avatar: req.body.avatar,
      email: req.body.email,
      password: hash,
    }))
    .then((user) => {
      res.status(200).send({ message: 'Пользователь создан' });
    })
    .catch((err) => {
      if (err.name === 'Error') {
        next(new RequestError('Переданы некорректные данные при создании пользователя.'));
        return;
      }

      if (err.name === 'MongoError' && err.code === 11000) {
        next(new EmailRepeatError('Пользователь с таким email уже существует.'));
        return;
      }

      next(err);
    });
};

module.exports.updateProfile = (req, res, next) => {
  const { name, email } = req.body;

  if (name === undefined || email === undefined) {
    throw new RequestError('Передайте корректные данные.');
  }

  Users.findOne({ email: `${email}` })
    .then(() => {
      throw new EmailRepeatError('Пользователь с таким email уже существует.');
    })
    .catch((err) => {
      next(err);
    });

  Users.findByIdAndUpdate(req.user._id,
    { name, email },
    {
      new: true,
      runValidators: true,
    })
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        throw new NotFoundError('Пользователь по указанному _id не найден.');
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new RequestError('Переданы некорректные данные при обновлении пользователя.'));
        return;
      }

      next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return Users.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' }),
      });
    })
    .catch((err) => {
      if (err.status !== 500) {
        next(new RequestError('Неправильные почта или пароль'));
        return;
      }

      next(err);
    });
};
