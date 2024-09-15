const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const config = require("../config");
module.exports = mongoose.model(
  "Guild",
  new Schema({
    guild: {
      type: String,
    },
    blacklistedStatus: {
      type: Boolean,
      default: false,
    },
    blacklistedReason: {
      type: String,
      default: "NoNe",
    },
    prefix: {
      type: String,
      default: config.DEFAULT_PREFIX,
    }, //not in use no message_content_intent
    pruning: {
      type: Boolean,
      default: true,
    },
    announce: {
      type: Boolean,
      default: true,
    },
    djCmd: {
      type: Array,
      default: [
        "lofi",
        "autoplay",
        "clear",
        "forward",
        "loop",
        "pause",
        "resume",
        "remove",
        "replay",
        "rewind",
        "seek",
        "shuffle",
        "forceskip",
        "stop",
        "volume",
      ],
    },
    djRoles: {
      type: Array,
      default: [],
    },
    botTC: {
      type: Array,
      default: [],
    },
    botVC: {
      type: Array,
      default: [],
    },
  })
);
