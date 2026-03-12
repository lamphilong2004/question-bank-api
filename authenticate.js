var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/User');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var Question = require('./models/Question');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
    return jwt.sign(user, process.env.SECRET_KEY || "12345-67890-09876-54321",
        { expiresIn: 3600 });
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_KEY || "12345-67890-09876-54321";

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        User.findOne({ _id: jwt_payload._id })
            .then(user => {
                if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            })
            .catch(err => {
                return done(err, false);
            });
    }));

exports.verifyUser = passport.authenticate('jwt', { session: false });

exports.verifyAdmin = function (req, res, next) {
    if (req.user && req.user.admin) {
        return next();
    } else {
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
};

exports.verifyAdminOrAuthor = function (req, res, next) {
    if (req.user && req.user.admin) {
        return next();
    }
    return exports.verifyAuthor(req, res, next);
};

exports.verifyAuthor = function (req, res, next) {
    Question.findById(req.params.questionId)
        .then(question => {
            if (!question) {
                var err = new Error('Question not found');
                err.status = 404;
                return next(err);
            }
            // Check if the current user is the author
            if (question.author && question.author.equals(req.user._id)) {
                return next();
            } else {
                var err = new Error('You are not the author of this question');
                err.status = 403;
                return next(err);
            }
        })
        .catch(err => next(err));
};
