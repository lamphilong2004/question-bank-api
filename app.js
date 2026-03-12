const createError = require("http-errors");
require("dotenv").config();
const express = require("express");
const cors = require('cors');
const connectDB = require("./config/db");
var passport = require('passport');
var authenticate = require('./authenticate'); // Ensures strategies are loaded

const quizRoutes = require("./routes/quizRoutes");
const questionRoutes = require("./routes/questionRoutes");
const usersRoutes = require("./routes/users");

const app = express();
connectDB();

// Allow cross-origin API calls from the React frontend.
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());

app.use("/users", usersRoutes);
app.use("/quizzes", quizRoutes);
app.use("/questions", questionRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error as JSON
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message,
            status: err.status || 500
        }
    });
});

module.exports = app;
