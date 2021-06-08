const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const cors = require('cors');
const auth = require('./middlewares/auth');
const { createUser, login } = require('./controllers/users');
const NotFoundError = require('./Errors/NotFoundError');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const errorLog = require('./Errors/ErrorsLog');

const { PORT = 3000 } = process.env;
const { MongoUrl = 'mongodb://localhost:27017/bitfilmsdb' } = process.env;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(requestLogger);

app.post('/signin', login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string(),
    password: Joi.string().min(8),
    name: Joi.string().min(2).max(30),
  }),
}), createUser);

app.use('/users', auth, require('./routes/users'));
app.use('/movies', auth, require('./routes/movie'));

app.use('*', auth, (req, res, next) => {
  next(new NotFoundError('Страница не найдена.'));
});

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => { errorLog(err, req, res, next); });

async function main() {
  await mongoose.connect(MongoUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  console.log(' Server connect to db ');

  await app.listen(PORT);
  console.log(` Server listen on ${PORT}`);
}

main();
