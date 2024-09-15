const { Schema, model } = require("mongoose");

module.exports = model(
  "premium-guild",
  new Schema({
    guildId: {
      type: String,
      required: true,
      unique: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    premium: {
      expiresAt: {
        type: Number,
        default: null,
      }, // not in use
    },
  })
);
