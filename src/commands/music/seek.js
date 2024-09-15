const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const Wait = require("util").promisify(setTimeout);

module.exports = {
  name: "seek",
  description: "Seeks to a specific position in the current song.",
  cooldown: 3,
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
    aliases: ["forward"],
    usage: "<time>",
    example: "40s",
    minArgsCount: 1,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "time",
        description: "time to seek to",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
  messageRun: async (client, message, args, player, data) => {
    const response = await Seek(client, player, args.join(" "));
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    let input = interaction.options.getString("time");
    const response = await Seek(client, player, input);
    await interaction.followUp(response);
  },
};

async function Seek(client, player, input) {
  const time = client.utils.parseTime(input);
  const embed = new EmbedBuilder();

  if (!time)
    return {
      embeds: [
        embed
          .setColor(client.config.COLORS.RedPink)
          .setDescription("### i cant read that time.\n\nexample times i can read are: `40s`, `1m 30s`."),
      ],
    };

  await player.seek(time);
  return {
    embeds: [
      embed
        .setColor(client.botcolor)
        .setDescription(`Seeked to \`${input}\`\n${await client.utils.createBar(client, player)}`),
    ],
  };
}
