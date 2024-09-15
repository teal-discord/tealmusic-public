const { EmbedBuilder } = require("discord.js");
const { ManagerUtils } = require("lavalink-client");
module.exports = {
  name: "previous",
  description: "Plays previos track to track.",
  cooldown: 6,
  isPremium: false,
  category: "MUSIC",
  SameVoiceChannel: true,
  InVoiceChannel: true,
  InBotVC: true,
  Player: true,
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
    ephemeral: false,
    options: [],
  },
  messageRun: async (client, message, args, player, data) => {
    const response = await Previous(client, player, message);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    const response = await Previous(client, player, interaction);
    await interaction.followUp(response);
  },
};

async function Previous(client, player, { member }) {
  if (!player.queue.previous[0]) return `No previous song/s not found in this player`;

  await player.play({ track: player.queue.previous[0] });

  const embed = new EmbedBuilder()
    .setColor(client.botcolor)
    .setDescription(
      `**previous track**: \`${client.utils.trimTitle(player.queue.current.info.title)}\` is now being played.`
    );
  return { embeds: [embed] };
}
