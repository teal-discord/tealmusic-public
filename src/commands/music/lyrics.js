const { Rlyrics } = require("rlyrics");
const rlyrics = new Rlyrics();
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "lyrics",
  description: "Shows lyrics for the currently playing song.",
  cooldown: 30,
  isPremium: true,
  category: "MUSIC",
  SameVoiceChannel: true,
  InVoiceChannel: true,
  InBotVC: false,
  Player: true,
  ActivePlayer: true,
  botPermissions: [],
  userPermissions: [],
  command: {
    enabled: true,
    aliases: ["ly"],
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
    await rlyrics
      .search(`${client.utils.trimTitle(player.queue.current.info.title)} ${player.queue.current.info.author}`)
      .then(async (search) => {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${search[0].title} by ${search[0].artist}`,
            iconURL: `${search[0].icon[0] || client.user.displayAvatarURL()}`,
            url: `${search[0].url}`,
          })
          .setDescription(
            `${
              (await rlyrics.getLyrics(search[0].url).then((x) => x.slice(0, 4085))) ||
              `# Restricted Lyrics\nUnfortunately we're not authorized to show these lyrics.`
            }.....`
          )
          .setThumbnail(`${search[0].icon[0] || client.user.displayAvatarURL({ dynamic: true, size: 4096 })}`)
          .setColor(client.config.COLORS.RedPink)
          .setFooter({
            text: "Lyrics provided by MusixMatch",
            iconURL: "https://cdn.discordapp.com/attachments/1133305000949461002/1140981278389313646/unnamed.png",
          });
        return await message.safeReply({ embeds: [embed] });
      })
      .catch(async () => {
        return await message.safeReply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.COLORS.RedPink)
              .setDescription(`Apologizing No lyrics found for this song!`),
          ],
        });
      });
  },
  interactionRun: async (client, interaction, player, data) => {
    await rlyrics
      .search(`${client.utils.trimTitle(player.queue.current.info.title)} ${player.queue.current.info.author}`)
      .then(async (search) => {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${search[0].title} by ${search[0].artist}`,
            iconURL: `${search[0].icon[0] || client.user.displayAvatarURL()}`,
            url: `${search[0].url}`,
          })
          .setDescription(
            `${
              (await rlyrics.getLyrics(search[0].url).then((x) => x.slice(0, 4085))) ||
              `# Restricted Lyrics\nUnfortunately we're not authorized to show these lyrics.`
            }.....`
          )
          .setThumbnail(`${search[0].icon[0] || client.user.displayAvatarURL({ dynamic: true, size: 4096 })}`)
          .setColor(client.config.COLORS.RedPink)
          .setFooter({
            text: "Lyrics provided by MusixMatch",
            iconURL: "https://cdn.discordapp.com/attachments/1133305000949461002/1140981278389313646/unnamed.png",
          });
        return await interaction.followUp({ embeds: [embed] });
      })
      .catch(async () => {
        return await interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.COLORS.RedPink)
              .setDescription(`Apologizing No lyrics found for this song!`),
          ],
        });
      });
  },
};
