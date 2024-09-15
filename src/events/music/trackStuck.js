const { EmbedBuilder } = require("discord.js");
const { inspect } = require("util");
module.exports = {
  name: "trackStuck",
  execute: async (client, player, track, payload) => {
    const guild = client.guilds.cache.get(player.guildId);

    const content =
      `**encountered an trackStuck in: ${guild.name}(${guild.id}) [${guild.memberCount} members]**\n` +
      `\`\`\`js\n` +
      `               TRACK               \n` +
      `${inspect(track, { depth: 1 })}` +
      `               Payload               \n` +
      `${inspect(payload, { depth: 1 })}\n` +
      `\`\`\``;
    //  client.errorHook.send({ content: content });
  },
};
