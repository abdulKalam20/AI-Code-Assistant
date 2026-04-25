const express = require("express");
const router = express.Router();
const { analyzeCode } = require("../controllers/aiController");

router.post("/analyze", analyzeCode);
router.get("/history", async (req, res) => {
  const data = await CodeHistory.find().sort({ createdAt: -1 });
  res.json(data);
});

module.exports = router;