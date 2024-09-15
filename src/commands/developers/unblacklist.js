const GuildDb = require("@models/settings");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "unblacklist",
  description: "something",
  category: "OWNER",
  botPermissions: [],
  command: {
    enabled: true,
    usage: "anything",
    aliases: ["ubl"],
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
    let dataBaseGuild = await GuildDb.findOne({ guild: args[0] });
    dataBaseGuild.blacklistedStatus = false;
    dataBaseGuild.blacklistedReason = args.slice(1).join(" ");
    await dataBaseGuild.save();
    console.log(dataBaseGuild);
    return message.safeReply({
      embeds: [
        new EmbedBuilder()
          .setColor(client.botcolor)
          .setDescription(`Successfully Un blacklisted **${check.name}** (${args[0]})`),
      ],
    });
  },
};
