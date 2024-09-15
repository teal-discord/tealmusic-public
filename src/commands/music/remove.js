const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
module.exports = {
  name: "remove",
  description: "Removes a track from the queue.",
  cooldown: 5,
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
    aliases: ["rm", "del", "delete"],
    usage: "<track in queue no.>",
    minArgsCount: 1,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "track",
        description: "track in queue no.",
        type: ApplicationCommandOptionType.Number,
        required: true,
      },
    ],
  },
  messageRun: async (client, message, args, player, data) => {
    const response = await Remove(client, player, args[0]);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    const input = interaction.options.getNumber("track");
    const response = await Remove(client, player, input);
    await interaction.followUp(response);
  },
};

async function Remove(client, player, input) {
  const emb = new EmbedBuilder().setColor(client.botcolor);
  if (isNaN(input)) return { embeds: [emb.setDescription(`You didn't entered a valid number`)] };
  if (input < 1) return { embeds: [emb.setDescription(`The number must be bigger than 0`)] };
  if (input > player.queue.tracks.length)
    return {
      embeds: [
        emb.setDescription(
          `The number must be smaller than the queue length\n\nqueue length: \`${player.queue.tracks.length}\``
        ),
      ],
    };
  emb.setDescription(
    `Removed the track no. \`${input}\` ~ \`${client.utils.trimTitle(
      player.queue.tracks[input - 1].info.title
    )}\` • song requested by <@${player.queue.tracks[input - 1].requester.id}>`
  );
  player.queue.tracks.splice(input - 1, 1);

  return { embeds: [emb] };
}
