const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    index: true,
    default: null
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  text: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  keywords: [{
    type: String
  }],
  correctAnswerIndex: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("Question", questionSchema);
