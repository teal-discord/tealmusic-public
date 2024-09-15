const { EmbedBuilder } = require("discord.js");
module.exports = {
  name: "invite",
  description: "get a link to invite me to your server.",
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
    aliases: ["i", "teal", "inv"],
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
  const emd = new EmbedBuilder()
    .setDescription(`**${client.emoji.invite} | I'm glad you like the bot. Here is the invite**`)
    .setFields(
      {
        name: "<:teal:1238802787664658513> Teal",
        value: `[Add Now](${client.config.INVITE.TEAL})`,
        inline: true,
      },
      {
        name: "<:grey:1238802789379870740> Grey",
        value: `[Add Now](${client.config.INVITE.GREY})`,
        inline: true,
      },
      {
        name: "<:Red:1172144394967715870> Red",
        value: `[Add Now](${client.config.INVITE.RED})`,
        inline: true,
      },
      {
        name: "<:Pink:1238796739654193183> Pink",
        value: `[Add Now](${client.config.INVITE.PINK})`,
        inline: true,
      },
      { name: `\u200b`, value: `\u200b`, inline: true },
      {
        name: "<:kitsune:1238802790172594178> Kitsune (lofi)",
        value: `[Add Now](${client.config.INVITE.KITSUNE})`,
        inline: true,
      },
      { name: `\u200b`, value: `\u200b`, inline: true }
    )
    .setColor(client.botcolor);

  return { embeds: [emd] };
}
