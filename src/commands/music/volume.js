const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
module.exports = {
  name: "volume",
  description: "change the volume of the player.",
  cooldown: 6,
  isPremium: false,
  category: "MUSIC",
  SameVoiceChannel: true,
  InVoiceChannel: true,
  InBotVC: true,
  Player: true,
  ActivePlayer: true,
  botPermissions: [],
  userPermissions: [],
  command: {
    enabled: true,
    aliases: ["v", "audio", "vol", "sound"],
    usage: "<volume-level>",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "volume",
        description: "The volume you want to set.",
        type: ApplicationCommandOptionType.Number,
        required: false,
      },
    ],
  },
  messageRun: async (client, message, args, player, data) => {
    const response = await Volume(client, player, args[0]);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    const input = interaction.options.getNumber("volume");
    const response = await Volume(client, player, input);
    await interaction.followUp(response);
  },
};

async function Volume(client, player, input) {
  const embed = new EmbedBuilder().setColor(client.botcolor);

  if (!input) return { embeds: [embed.setDescription(`current Volume: \`${player.volume}%\``)] };

  const number = Number(input);

  if (isNaN(number))
    return {
      embeds: [embed.setDescription("### Please provide a valid volume number.")],
    };
  if (number > 150)
    return {
      embeds: [embed.setDescription("### The volume can't be higher than `150%`.")],
    };
  if (number < 0)
    return {
      embeds: [embed.setDescription("### The volume can't be lower than `0%`.")],
    };
  player.setVolume(number);
  return {
    embeds: [embed.setDescription(`Set the volume to \`${player.volume.toFixed()}%\``)],
  };
}
