/**
 * @type {import("@structures/Command")}
 */
const { EmbedBuilder } = require("discord.js");
const db1 = require("@models/settings");
//const db2 = require("@models/247");
const db3 = require("@models/premium");
module.exports = {
  name: "viewdata",
  description: "something",
  category: "OWNER",
  botPermissions: [],
  command: {
    enabled: true,
    usage: "anything",
    minArgsCount: 0,
  },
  slashCommand: {
    enabled: false,
  },
  messageRun: async (client, message, args) => {
    if (!client.config.OWNER_IDS.includes(message.author.id)) return;
    if (!args[0]) return message.channel.send("provide a guild id master");
    const data1 = await db1.findOne({
      guild: args[0],
    });
    const data2 = await client.twofoursevenModel.findOne({
      guild: args[0],
    });
    const data3 = await db3.findOne({
      guildId: args[0],
    });
    const embed = new EmbedBuilder().setColor(client.botcolor).addFields(
      {
        name: "Settings",
        value: `\`\`\`\n${data1}\`\`\``,
      },
      {
        name: "247",
        value: `\`\`\`\n${data2}\`\`\``,
      },
      {
        name: "premium",
        value: `\`\`\`\n${data3}\`\`\``,
      }
    );
    message.channel.send({ embeds: [embed] });
  },
};
