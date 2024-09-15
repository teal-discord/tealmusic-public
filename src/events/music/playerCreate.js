module.exports = {
  name: "playerCreate",
  execute: async (client, player) => {
    await player.setVolume(85);
  },
};
