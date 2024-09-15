const premiuemDB = require("@models/premium");
const UsersDB = require("@models/premium-users");

const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "removeperks",
  description: "",
  category: "OWNER",
  botPermissions: [],
  command: {
    enabled: true,
    aliases: ["rp"],
    usage: "anything",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: false,
  },
  messageRun: async (client, message, args) => {
    const checkRole = message.member.roles.cache.get("864535010928492544");
    if (!client.config.OWNER_IDS.includes(message.author.id) && !checkRole) return;
    try {
      if (!args[0]) return message.safeReply("master user or guild?");
      if (!["user", "guild"].includes(args[0]?.toLowerCase())) return message.safeReply("master user or guild?");
      if (!args[1]) return message.safeReply("master i need a ID");

      if (args[0].toLowerCase() === "guild") {
        const check = await client.guilds.fetch(args[1]).catch((e) => {});

        let guild = await premiuemDB.findOne({
          guildId: args[1],
        });
        if (!guild) {
          return message.safeReply("no data found");
        }
        await guild.deleteOne();
        return message.safeReply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.botcolor)
              .setDescription(`Successfully **removed** perks from **${check?.name}** (${args[1]})`),
          ],
        });
      }
      if (args[0].toLowerCase() === "user") {
        const check = await client.users.fetch(args[1]).catch((e) => {});
        if (!check)
          return message.safeReply({
            embeds: [
              new EmbedBuilder().setColor(client.config.COLORS.RedPink).setDescription(`**this user does not exists**`),
            ],
          });

        let doc = await UsersDB.findOne();
        if (!doc) return message.reply("cant find my premium users database");
        if (!doc.Ids.includes(args[1])) return message.safeReply("this user is not a premium user");
        doc.Ids.pull(args[1]);
        await doc.save();

        client.premiumUsers = doc.Ids;
        return message.safeReply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.botcolor)
              .setDescription(`Successfully **removed** perks from **${check.tag}** (${args[1]})`),
          ],
        });
      }
    } catch (error) {
      console.error(error);
    }
  },
};
