module.exports = {
  name: "playerDestroy",
  execute: async (client, player) => {
    const guild = client.guilds.cache.get(player.guildId);
    if (!guild) return;
    const data = await client.getGuildData(guild);

    if (data.pruning) {
      if (player.get("message") && player.get("message").deletable)
        player
          .get("message")
          .delete()
          .catch(() => {});
    } else {
    }
  },
};
