const express = require("express");
const router = express.Router();
const questionCtrl = require("../controllers/questionController");
const authenticate = require("../authenticate");

// Any authenticated user can read questions (for taking quizzes), but only admins can manage them.
router.get("/", authenticate.verifyUser, questionCtrl.getQuestions);
router.get("/:questionId", authenticate.verifyUser, questionCtrl.getQuestionById);

router.post("/", authenticate.verifyUser, authenticate.verifyAdmin, questionCtrl.createQuestion);
router.put("/:questionId", authenticate.verifyUser, authenticate.verifyAdmin, questionCtrl.updateQuestion);
router.delete("/:questionId", authenticate.verifyUser, authenticate.verifyAdmin, questionCtrl.deleteQuestion);

module.exports = router;
