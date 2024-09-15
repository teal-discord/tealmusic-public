module.exports = {
  name: "queueEnd",
  execute: async (client, player) => {
    let guild = client.guilds.cache.get(player.guildId);
    if (!guild) return;
    const data = await client.getGuildData(guild);

    if (data.pruning) {
      if (player.get("message") && player.get("message").deletable)
        player
          .get("message")
          .delete()
          .catch(() => { });
    } else { }

    if (player.get("autoplay")) {
      return client.utils.autoplay(player, client);
    }

  },
};
