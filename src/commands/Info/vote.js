const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
  name: "vote",
  description: "Returns the link to vote Teal Music.",
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
    aliases: ["topgg"],
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
    const response = await Vote(client);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    const response = await Vote(client);
    await interaction.followUp(response);
  },
};

async function Vote(client) {
  let embed = new EmbedBuilder()
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
      url: client.botinvite,
    })
    .setDescription(
      `[<:emoji:1073562678959812658> Click here](${client.config.VOTE}) to vote the bot and use vote locked commands for the next 12 hours.`
    )
    .setColor(client.botcolor);

  const row = new ActionRowBuilder().addComponents([
    new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Vote").setURL(client.config.VOTE),
  ]);

  return { embeds: [embed], components: [row] };
}
