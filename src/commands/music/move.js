const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
module.exports = {
  name: "move",
  description: "Replay the current song!",
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
        name: "from",
        description: "The queue number of the song",
        type: ApplicationCommandOptionType.Integer,
        required: true,
        min_value: 1,
      },
      {
        name: "to",
        description: "The position in queue you want to move",
        type: ApplicationCommandOptionType.Integer,
        required: true,
        min_value: 1,
      },
    ],
  },
  messageRun: async (client, message, args, player, data) => {
    const response = await Replay(client, player, message, args[0], args[1]);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    const from = interaction.options.getInteger("from");
    const to = interaction.options.getInteger("to");

    const response = await Replay(client, player, interaction, from, to);
    await interaction.followUp(response);
  },
};

async function Replay(client, player, { member }, from, to) {
  if (from > player.queue.tracks.length || (from && !player.queue.tracks[from - 1])) return `Song not found in queue.`;
  if (to > player.queue.tracks.length || !player.queue.tracks[to - 1])
    return `The queue is not that long. queue size: ${player.queue.tracks.length}`;

  const song = player.queue.tracks[from - 1];

  await player.queue.tracks.splice(from - 1, 1);
  await player.queue.tracks.splice(to - 1, 0, song);

  const embed = new EmbedBuilder()
    .setColor(client.botcolor)
    .setDescription(`**Moved**: \`${client.utils.trimTitle(song.info.title)}\` to position: ${to}`);

  return { embeds: [embed] };
}
