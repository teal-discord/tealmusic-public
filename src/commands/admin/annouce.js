const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const db = require("@models/settings");
module.exports = {
  name: "announce-emds",
  description: "enable/disable sending of nowplaying messages.",
  cooldown: 6,
  isPremium: false,
  category: "ADMIN",
  SameVoiceChannel: false,
  InVoiceChannel: false,
  InBotVC: false,
  Player: false,
  ActivePlayer: false,
  botPermissions: [],
  userPermissions: ["Administrator"],
  command: {
    enabled: true,
    aliases: [],
    usage: "",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "status",
        description: "enable/disable sending of nowplaying messages.",
        type: ApplicationCommandOptionType.Boolean,
        required: true,
        choices: [
          {
            name: "enable",
            value: "true",
          },
          {
            name: "disable",
            value: "false",
          },
        ],
      },
    ],
  },
  messageRun: async (client, message, args, player, data) => {
    const response = await setAnnouce(client, message, args[0]);
    await message.channel.safeSend(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    let status = interaction.options.getBoolean("status");
    const response = await setAnnouce(client, interaction, status);
    await interaction.followUp(response);
  },
};

async function setAnnouce(client, { guildId }, status) {
  const data = await db.findOne({ guild: guildId });

  if (status === data.announce) {
    const embed = new EmbedBuilder()
      .setTitle("Annoucement of Nowplaying embeds")
      .setDescription(`Announce is already set to \`${status}\``)
      .setColor(client.botcolor);
    return { embeds: [embed] };
  }

  await db.findOneAndUpdate({ guild: guildId }, { announce: status });
  const embed = new EmbedBuilder()
    .setTitle("Annoucement of Nowplaying embeds")
    .setDescription(`Announce has been set to \`${status}\``)
    .setColor(client.botcolor);
  return { embeds: [embed] };
}
