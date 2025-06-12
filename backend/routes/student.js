const express = require("express");
const router = express.Router();
const { getStudentSummary } = require("../controllers/studentController");

router.get("/summary/:userId", getStudentSummary);

module.exports = router;
