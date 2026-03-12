const Question = require("../models/Question");
const Quiz = require("../models/Quiz");

// GET /questions
exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /questions/:questionId
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question)
      return res.status(404).json({ message: "Question not found" });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /questions
exports.createQuestion = async (req, res) => {
  try {
    const questionData = { ...req.body, author: req.user._id };
    const question = new Question(questionData);
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /questions/:questionId
exports.updateQuestion = async (req, res) => {
  try {
    const { author, _id, ...safeBody } = req.body || {};
    const question = await Question.findByIdAndUpdate(req.params.questionId, safeBody, {
      new: true,
    });
    if (!question)
      return res.status(404).json({ message: "Question not found" });
    res.json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /questions/:questionId
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.questionId);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    await Quiz.updateMany(
      { questions: question._id },
      { $pull: { questions: question._id } }
    );
    res.json({ message: "Question deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
