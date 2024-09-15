const { inspect } = require("util");
module.exports = {
  name: "trackError",
  execute: async (client, player, track, payload) => {
    if (player.get("message") && player.get("message").deletable)
      player
        .get("message")
        .delete()
        .catch(() => {});
    const guild = client.guilds.cache.get(player.guildId);
    if (!guild) return;

    const content =
      `**encountered an track error in: ${guild.name}(${guild.id}) [${guild.memberCount} members]**\n` +
      `\`\`\`js\n` +
      `               TRACK               \n` +
      `${inspect(track, { depth: 1 })}` +
      `               Payload               \n` +
      `${inspect(payload, { depth: 1 })}\n` +
      `\`\`\``;
    // client.errorHook.send({ content: content });
  },
};
