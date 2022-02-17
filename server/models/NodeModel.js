const mongoose = require("mongoose");

const NodeSchema = new mongoose.Schema({
  label: String,
  color: String,
  userId: String,
  dateCreated: Date,
  position: Object,
  data: {
    type: { type: String }, // String, Audio
    content: mongoose.Schema.Types.Mixed
  }
});

module.exports = mongoose.model("Node", NodeSchema);
