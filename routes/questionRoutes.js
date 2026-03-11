const express = require("express");
const router = express.Router();
const questionCtrl = require("../controllers/questionController");
const authenticate = require("../authenticate");

router.get("/", questionCtrl.getQuestions);
router.get("/:questionId", questionCtrl.getQuestionById);
router.post("/", authenticate.verifyUser, questionCtrl.createQuestion);

// For PUT and DELETE, we need to pass the question id. Note that verifyAuthor expects req.params.questionId.
// We must change the route parameter to match what the middleware expects, or we change the middleware.
// Let's change the parameter to :questionId for consistency with the VerifyAuthor middleware.
router.put("/:questionId", authenticate.verifyUser, authenticate.verifyAuthor, questionCtrl.updateQuestion);
router.delete("/:questionId", authenticate.verifyUser, authenticate.verifyAuthor, questionCtrl.deleteQuestion);

module.exports = router;
