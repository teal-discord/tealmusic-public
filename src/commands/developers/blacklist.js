const GuildDb = require("@models/settings");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "blacklist",
  description: "something",
  category: "OWNER",
  botPermissions: [],
  command: {
    enabled: true,
    usage: "anything",
    aliases: ["bl"],
    minArgsCount: 0,
  },
  slashCommand: {
    enabled: false,
  },
  messageRun: async (client, message, args) => {
    const checkRole = message.member.roles.cache.get("864535010928492544");
    if (!client.config.OWNER_IDS.includes(message.author.id) && !checkRole) return;

    if (!args[0]) return message.safeReply("Master give me a guild ID");

    const check = await client.guilds.fetch(args[0]).catch((e) => {});
    if (!check)
      return message.safeReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.COLORS.RedPink)
            .setDescription(`**Master i'm not added to this guild**`),
        ],
      });
    const doc = await GuildDb.findOne({ guild: args[0] });
    doc.blacklistedStatus = false;
    doc.blacklistedReason = args.slice(1).join(" ");
    await doc.save();
    return message.safeReply({
      embeds: [
        new EmbedBuilder()
          .setColor(client.botcolor)
          .setDescription(`Successfully blacklisted **${check.name}** (${args[0]})`),
      ],
    });
  },
};
