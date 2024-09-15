const { Schema, model } = require("mongoose");

module.exports = model(
  "premium-users",
  new Schema({
    Ids: [String],
  })
);
