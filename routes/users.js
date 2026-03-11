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
    const user = await User.register(new User({ username: req.body.username }), req.body.password);
    if (req.body.admin !== undefined) user.admin = req.body.admin;
    await user.save();
    passport.authenticate('local')(req, res, () => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: true, status: 'Registration Successful!' });
    });
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.json({ err: err });
  }
});

/* POST login */
router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  var token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token: token, admin: req.user.admin, status: 'You are successfully logged in!' });
});

module.exports = router;
