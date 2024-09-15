const { EmbedBuilder } = require("discord.js");
module.exports = {
  name: "trackEnd",
  execute: async (client, player) => {
    const guild = client.guilds.cache.get(player.guildId);
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
