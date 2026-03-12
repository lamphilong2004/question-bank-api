var express = require('express');
var router = express.Router();
var User = require('../models/User');
var passport = require('passport');
var authenticate = require('../authenticate');

/* GET users listing. Only for Admins */
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  User.find({})
    .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
    }, (err) => next(err))
    .catch((err) => next(err));
});

/* POST signup */
router.post('/signup', async (req, res, next) => {
  try {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!username || !password) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.json({ success: false, message: 'username and password are required' });
    }

    const user = await User.register(new User({ username }), password);

    // Accept boolean-ish admin values
    if (typeof req.body?.admin !== 'undefined') {
      user.admin = req.body.admin === true || req.body.admin === 'true' || req.body.admin === 'on';
    }
    await user.save();

    // Do NOT call passport.authenticate() here because this project doesn't use sessions.
    // Clients should call /users/login to obtain a JWT.
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, status: 'Registration Successful!' });
  } catch (err) {
    // passport-local-mongoose uses name: 'UserExistsError'
    if (err && err.name === 'UserExistsError') {
      res.statusCode = 409;
      res.setHeader('Content-Type', 'application/json');
      return res.json({ success: false, message: err.message || 'User already exists' });
    }

    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: false, message: err?.message || 'Internal Server Error', err: err });
  }
});

/* POST login */
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({ success: false, message: 'Invalid username or password.' });
    }

    var token = authenticate.getToken({ _id: user._id, admin: user.admin });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, token: token, admin: user.admin, status: 'You are successfully logged in!' });
  })(req, res, next);
});

/* GET current user profile */
router.get('/me', authenticate.verifyUser, (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({
    _id: req.user._id,
    username: req.user.username,
    admin: Boolean(req.user.admin)
  });
});

module.exports = router;
