const { Schema, model } = require("mongoose");

let Setup = new Schema({
  guild: String,
  channel: String,
  message: String,
});

module.exports = model("musicsettings", Setup);
// not is use currently as no MESSAGE_CONTENT_INTENT
