const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const BadRequestError = require('../errors/badRequestError');

const { NODE_ENV, JWT_SECRET } = process.env;

function signin(req, res, next) {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .orFail(() => { throw new BadRequestError('Incorrent email or password'); })
    .then((user) => {
      bcrypt.compare(password, user.password)
        .then((matches) => {
          if (matches) {
            const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret-key', { expiresIn: '7d' });
            res.cookie('jwt', token, {
              maxAge: 3600000 * 24 * 7,
              httpOnly: true,
              sameSite: true,
            });
            res.send({ _id: user._id, name: user.name, email: user.email });
          } else {
            throw new BadRequestError('Incorrent email or password');
          }
        })
        .catch(next);
    })
    .catch(next);
}

module.exports = {
  signin,
};
