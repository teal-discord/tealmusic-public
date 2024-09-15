const { EmbedBuilder } = require("discord.js");
const prettyMs = require("pretty-ms");
module.exports = {
  name: "grab",
  description: "saves the currrent playing song in our DMs.",
  cooldown: 6,
  isPremium: false,
  category: "MUSIC",
  botPermissions: [],
  userPermissions: [],
  SameVoiceChannel: true,
  InVoiceChannel: true,
  InBotVC: true,
  Player: true,
  ActivePlayer: true,
  command: {
    enabled: true,
    aliases: ["dmnp"],
    usage: "",
    example: "",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
  },
  messageRun: async (client, message, args, player) => {
    const response = await Grab(client, message, player);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player) => {
    const response = await Grab(client, interaction, player);
    await interaction.followUp(response);
  },
};

async function Grab(client, { member, guild, channel }, player) {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: "Saved Song:",
      iconURL: member.displayAvatarURL({ dynamic: true }),
      url: client.config.SUPPORT_SERVER,
    })
    .setThumbnail(
      `${
        player.queue.current.info.artworkUrl
          ? player.queue.current.info.artworkUrl
          : `https://img.youtube.com/vi/${player.queue.current.identifier}/maxresdefault.jpg`
      }`
    )
    .setColor(client.botcolor)
    .setTitle(`${player.playing ? `▶` : `⏸`} **${client.utils.trimTitle(player.queue.current.info.title)}**`)
    .setURL(player.queue.current.info.uri)
    .addFields(
      {
        name: `Duration`,
        value: `\`${prettyMs(player.queue.current.info.duration, {
          colonNotation: true,
        })}\``,
        inline: true,
      },
      {
        name: `Song By:`,
        value: `\`${player.queue.current.info.author}\``,
        inline: true,
      },
      {
        name: `Play it with:`,
        value: `\`/play ${player.queue.current.info.uri}\``,
        inline: false,
      },
      { name: `saved from`, value: `<#${channel.id}>` }
    )
    .setFooter({
      text: `Song requested by: ${player.queue.current.requester.tag} | in server ${guild.name}`,
      iconURL: player.queue.current.requester.displayAvatarURL(),
    });

  await member.send({ embeds: [embed] }).catch((e) => {
    return { content: `Your Dm's are closed` };
  });

  return {
    embeds: [new EmbedBuilder().setDescription(`📭 Check your DM`).setColor(client.botcolor)],
  };
}
