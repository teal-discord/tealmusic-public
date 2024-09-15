const { EmbedBuilder } = require("discord.js");
module.exports = {
  name: "support",
  description: "get the link to support server.",
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
    aliases: [],
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
    const response = await Invite(client);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    const response = await Invite(client);
    await interaction.followUp(response);
  },
};

async function Invite(client) {
  var embed = new EmbedBuilder()
    .setDescription(`**[need help? find help for teal by clicking here](${client.config.SUPPORT_SERVER})**`)
    .setColor(client.botcolor);
  return { embeds: [embed] };
}
