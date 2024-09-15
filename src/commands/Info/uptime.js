const { EmbedBuilder } = require("discord.js");
const prettyms = require("pretty-ms");

module.exports = {
  name: "uptime",
  description: "Returns the duration on how long the bot is online.",
  cooldown: 5,
  isPremium: false,
  category: "INFO",
  SameVoiceChannel: false,
  InVoiceChannel: false,
  InBotVC: false,
  Player: false,
  ActivePlayer: false,
  botPermissions: [],
  userPermissions: [],
  command: {
    enabled: true,
    aliases: ["u"],
    usage: "",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [],
  },
  messageRun: async (client, message, args, player, data) => {
    const response = await Uptime(client);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    const response = await Uptime(client);
    await interaction.followUp(response);
  },
};

async function Uptime(client) {
  let uptime = await prettyms(client.uptime, { verbose: true });
  let embed = new EmbedBuilder()
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
      url: client.botinvite,
    })
    .setDescription(`\`\`\`\n uptime : ${uptime}\`\`\`\nLast restart • <t:${Math.floor(client.readyTimestamp / 1000)}>`)
    .setColor(client.botcolor);
  return { embeds: [embed] };
}
