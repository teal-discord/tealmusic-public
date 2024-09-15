const { Schema, model } = require("mongoose");

const User = new Schema({
  UserId: {
    type: String,
    required: true,
  },
  savedSongs: Array,
  spotifyUId: String,
});

module.exports = model("User", User);
