const mongoose = require("mongoose");
const Schema = mongoose.Schema;
module.exports = mongoose.model(
  "Botstats",
  new Schema({
    songs: {
      queued: { type: Number, default: 0 },
      played: { type: Number, default: 0 },
    },
    commands: {
      runned: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      success: { type: Number, default: 0 },
    },
  })
);
