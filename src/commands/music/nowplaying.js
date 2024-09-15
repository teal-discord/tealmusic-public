const { EmbedBuilder } = require("discord.js");
module.exports = {
  name: "nowplaying",
  description: "shows you the current playing song.",
  cooldown: 6,
  isPremium: false,
  category: "MUSIC",
  SameVoiceChannel: false,
  InVoiceChannel: false,
  InBotVC: false,
  Player: true,
  ActivePlayer: true,
  botPermissions: [],
  userPermissions: [],
  command: {
    enabled: true,
    aliases: ["np"],
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
    const response = await Nowplaying(client, player);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    const response = await Nowplaying(client, player);
    await interaction.followUp(response);
  },
};

async function Nowplaying(client, player) {
  let embed = new EmbedBuilder()
    .setAuthor({ name: `Now Playing`, iconURL: client.user.displayAvatarURL() })
    .setDescription(
      `[\`${client.utils.trimTitle(player.queue.current.info.title)}\`](${client.botinvite}) by ${
        player.queue.current.info.author
      }\n ${await client.utils.createBar(client, player)}`
    )
    .setThumbnail(`${client.user.displayAvatarURL({ size: 4096, extension: "png" })}`)
    .setFooter({
      text: `song requested by ${player.queue.current.requester.username}`,
      iconURL: player.queue.current.requester.displayAvatarURL(),
    })
    .setColor(client.botcolor);
  return { embeds: [embed] };
}
