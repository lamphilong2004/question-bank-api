const Quiz = require("../models/Quiz");
const Question = require("../models/Question");

// GET /quizzes (populate questions)
exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("questions");
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /quizzes/:quizId
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate("questions");
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /quizzes
exports.createQuiz = async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /quizzes/:id
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /quizzes/:id
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select("questions");
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const questionIds = Array.isArray(quiz.questions) ? quiz.questions : [];
    if (questionIds.length > 0) {
      await Question.deleteMany({ _id: { $in: questionIds } });
    }

    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: "Quiz deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// GET /quizzes/:quizId/populate (questions chứa từ "capital")
exports.getCapitalQuestions = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate({
      path: "questions",
      match: { text: { $regex: "capital", $options: "i" } }
    });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /quizzes/:quizId/question (1 câu hỏi mới và add vào quiz)
exports.addQuestionToQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const question = new Question({ ...req.body, quiz: quiz._id });
    await question.save();

    await Quiz.findByIdAndUpdate(
      quiz._id,
      { $addToSet: { questions: question._id } },
      { new: true }
    );

    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// POST /quizzes/:quizId/questions (nhiều câu hỏi mới và add vào quiz)
exports.addManyQuestions = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const payload = Array.isArray(req.body) ? req.body : [];
    const questions = await Question.insertMany(
      payload.map((q) => ({ ...q, quiz: quiz._id }))
    );
    const ids = questions.map((q) => q._id);

    await Quiz.findByIdAndUpdate(
      quiz._id,
      { $addToSet: { questions: { $each: ids } } },
      { new: true }
    );

    res.json(questions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
