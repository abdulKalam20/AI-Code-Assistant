const mongoose = require("mongoose");

const CodeHistorySchema = new mongoose.Schema({
  code: String,
  language: String,
  errors: String,
  fixedCode: String,
  suggestions: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("CodeHistory", CodeHistorySchema);