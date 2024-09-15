const mongoose = require("mongoose");
const Schema = mongoose.Schema;
module.exports = mongoose.model(
  "GREY_247",
  new Schema({
    guild: {
      type: String,
    },
    autojoin: {
      type: Boolean,
      default: false,
    },
    autojoinVC: {
      type: String,
      default: null,
    },
    autojoinTC: {
      type: String,
      default: null,
    },
  })
);
