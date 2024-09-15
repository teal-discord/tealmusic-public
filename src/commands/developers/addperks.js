const premiuemDB = require("@models/premium");
const UsersDB = require("@models/premium-users");

const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "addperks",
  description: "",
  category: "OWNER",
  botPermissions: [],
  command: {
    enabled: true,
    aliases: ["ep"],
    usage: "anything",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: false,
  },
  messageRun: async (client, message, args) => {
    const checkRole = message.member.roles.cache.get("808424540543647744");
    if (!client.config.OWNER_IDS.includes(message.author.id) && !checkRole) return;
    try {
      if (!args[0]) return message.safeReply("master user or guild?");
      if (!["user", "guild"].includes(args[0].toLowerCase())) return message.safeReply("master user or guild?");
      if (!args[1]) return message.safeReply("master i need a ID");

      if (args[0].toLowerCase() === "guild") {
        const check = await client.guilds.fetch(args[1]).catch((e) => {});
        if (!check)
          return message.safeReply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.COLORS.RedPink)
                .setDescription(`**i'm not added to this guild**`),
            ],
          });

        let guild = await premiuemDB.findOne({
          guildId: args[1],
        });
        if (!guild) {
          guild = new premiuemDB({
            guildId: args[1],
          });
        }
        guild.isPremium = true;
        guild.premium.expiresAt = 0;
        await guild.save();
        return message.safeReply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.botcolor)
              .setDescription(`Successfully added perks to **${check.name}** (${args[1]})`),
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
        if (doc.Ids.includes(args[1])) return message.safeReply("this user is already a premium user");
        doc.Ids.push(args[1]);
        await doc.save();
        client.premiumUsers = doc.Ids;

        return message.safeReply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.botcolor)
              .setDescription(`Successfully added perks to **${check.tag}** (${args[1]})`),
          ],
        });
      }
    } catch (error) {
      console.error(error);
    }
  },
};
