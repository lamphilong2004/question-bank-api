const express = require("express");
const router = express.Router();
const quizCtrl = require("../controllers/quizController");
const authenticate = require("../authenticate");

// Any authenticated user can read quizzes (take quizzes), but only admins can manage them.
router.get("/", authenticate.verifyUser, quizCtrl.getQuizzes);
router.get("/:quizId", authenticate.verifyUser, quizCtrl.getQuizById);

router.post("/", authenticate.verifyUser, authenticate.verifyAdmin, quizCtrl.createQuiz);
router.put("/:id", authenticate.verifyUser, authenticate.verifyAdmin, quizCtrl.updateQuiz);
router.delete("/:id", authenticate.verifyUser, authenticate.verifyAdmin, quizCtrl.deleteQuiz);

router.get("/:quizId/populate", authenticate.verifyUser, quizCtrl.getCapitalQuestions);
router.post("/:quizId/question", authenticate.verifyUser, authenticate.verifyAdmin, quizCtrl.addQuestionToQuiz);
router.post("/:quizId/questions", authenticate.verifyUser, authenticate.verifyAdmin, quizCtrl.addManyQuestions);

module.exports = router;
