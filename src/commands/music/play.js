const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const fetch = require("node-fetch");
const premiuemDB = require("@models/premium");
module.exports = {
  name: "play",
  description: "plays a song.",
  description_localizations: {
    "en-US": "Plays a song",
    de: "Spielt ein Lied",
    ko: "노래 재생",
    id: "Memutar lagu",
    hi: "एक गाना बजाओ।",
    nl: "Speelt een liedje af.",
    tr: "Bir şarkı çalar.",
    it: "Riproduce un brano.",
  },
  cooldown: 6,
  isPremium: false,
  category: "MUSIC",
  botPermissions: [],
  userPermissions: [],
  SameVoiceChannel: true,
  InVoiceChannel: true,
  InBotVC: true,
  command: {
    enabled: true,
    aliases: ["p", "bajao"],
    usage: "<song name or url>",
    example: "Death bed by Powfu",
    minArgsCount: 1,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "query",
        description: "enter song name or url",
        description_localizations: {
          "en-US": "enter song name or url",
          de: "Geben Sie den Songnamen oder die URL ein",
          ko: "노래 제목 또는 URL을 입력하십시오.",
          id: "Masukkan nama lagu atau url",
          hi: "गाने का नाम या यूआरएल दर्ज करें",
          nl: "Voer de naam van het nummer of de url in",
          tr: "Şarkı adını veya url'sini girin",
          it: "Inserisci il nome della canzone o l'URL",
        },
        required: true,
        type: ApplicationCommandOptionType.String,
        autocomplete: true,
      },
    ],
  },
  messageRun: async (client, message, args, player) => {
    let query = args.join(" ");
    let { member, guild } = message;
    const { channel } = message.member.voice;
    const emd = new EmbedBuilder().setColor(client.botcolor);

    if (
      !guild.members.me
        .permissionsIn(channel)
        .has([PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.ViewChannel])
    ) {
      return {
        embeds: [
          new EmbedBuilder()
            .setColor(client.botcolor)
            .setDescription(
              `I am missing the \`ViewChannel\`, \`Connect\` & \`Speak\` Voice permission in your voice chat!`
            ),
        ],
      };
    }
    if (!query) {
      emd.setDescription(`Please enter a song name or url to play!`);
      return message.safeReply({ embeds: [emd] });
    }
    if (!player) {
      player = await client.manager.createPlayer({
        guildId: guild.id,
        voiceChannelId: member.voice.channelId,
        textChannelId: message.channel.id,
        selfDeaf: true,
      });
      player.connect();
    }

    try {
      let guildPremium = await premiuemDB.findOne({
        guildId: guild.id,
      });
      if (player.queue.tracks.length > 700 && !guildPremium) {
        return message.safeReply({
          embeds: [
            emd
              .setColor(client.botcolor)
              .setDescription(
                `The queue is too long. The maximum length for this guild is \`700\` songs. or subscribe to [Teal Premium](https://www.patreon.com/join/lorenzo132) (supporter tier or higher) on this server to bypass this limitation.`
              ),
          ],
        });
      }
      let result = await client.searchTrack(query, { requester: member.user }, player);
      const tracks = result.tracks;
      if (!tracks.length)
        return message.safeReply({
          embeds: [
            emd.setDescription(
              `**${client.emoji.error} | No songs found. Try to be as specific as possible by only including song title and artist name!!**`
            ),
          ],
        });
      if (result.loadType === "playlist") {
        let guildPremium = await premiuemDB.findOne({
          guildId: guild.id,
        });
        if (tracks.length > 699 && !guildPremium) {
          return await message.safeReply({
            embeds: [
              emd
                .setColor(client.botcolor)
                .setTitle("The queue is too long")
                .setDescription(
                  `The maximum length is \`699\` songs.\nSubscribe to [Teal Premium](https://www.patreon.com/join/lorenzo132) on this server to bypass this limitation.`
                ),
            ],
          });
        } else {
          player.queue.add(tracks);
        }
      } else player.queue.add(tracks[0]);
      if (!player.playing) player.play();
      const response =
        result.loadType === "playlist"
          ? {
              embeds: [
                emd.setDescription(
                  `${client.emoji.playlist} added ${tracks.length} tracks from playlist: \`${result.playlist.title}\` ${
                    result.playlist.author ? `by *${result.playlist.author}*` : ""
                  }`
                ),
              ],
            }
          : {
              embeds: [
                emd.setDescription(
                  `${client.emoji.playlist} added \`${client.utils.trimTitle(tracks[0].info.title)}\` to the queue`
                ),
              ],
            };
      return message.safeReply(response);
    } catch (err) {
      client.logger.error(err);
    }
  },
  interactionRun: async (client, interaction, player) => {
    let query = interaction.options.getString("query");
    let { member, guild } = interaction;
    const { channel } = interaction.member.voice;
    const emd = new EmbedBuilder().setColor(client.botcolor);

    if (
      !guild.members.me
        .permissionsIn(channel)
        .has([PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.ViewChannel])
    ) {
      return {
        embeds: [
          new EmbedBuilder()
            .setColor(client.botcolor)
            .setDescription(
              `I am missing the \`ViewChannel\`, \`Connect\` & \`Speak\` Voice permission in your voice chat!`
            ),
        ],
      };
    }
    if (!query) {
      emd.setDescription(`Please enter a song name or url to play!`);
      return interaction.editReply({ embeds: [emd] });
    }

    if (!player) {
      player = await client.manager.createPlayer({
        guildId: guild.id,
        voiceChannelId: member.voice.channelId,
        textChannelId: interaction.channel.id,
        selfDeaf: true,
      });
      player.connect();
    }

    try {
      let guildPremium = await premiuemDB.findOne({
        guildId: guild.id,
      });
      if (player.queue.tracks.length > 700 && !guildPremium) {
        return interaction.editReply({
          embeds: [
            emd
              .setColor(client.botcolor)
              .setDescription(
                `The queue is too long. The maximum length is \`700\` songs. or subscribe to [Teal Premium](https://www.patreon.com/join/lorenzo132) on this server to bypass this limitation.`
              ),
          ],
        });
      }
      let result = await client.searchTrack(query, { requester: member.user }, player);
      const tracks = result.tracks;

      if (!tracks.length)
        return interaction.editReply({
          embeds: [
            emd.setDescription(
              `**${client.emoji.error} | No songs found. Try to be as specific as possible by only including song title and artist name!!**`
            ),
          ],
        });

      if (result.loadType === "playlist") {
        let guildPremium = await premiuemDB.findOne({
          guildId: guild.id,
        });
        if (tracks.length > 700 && !guildPremium) {
          return await interaction.editReply({
            embeds: [
              emd
                .setColor(client.botcolor)
                .setTitle("The queue is too long")
                .setDescription(
                  `The maximum length is \`700\` songs.\nSubscribe to [Teal Premium](https://www.patreon.com/join/lorenzo132) on this server to bypass this limitation.`
                ),
            ],
          });
        } else {
          player.queue.add(tracks);
        }
      } else player.queue.add(tracks[0]);
      if (!player.playing) player.play();
      const response =
        result.loadType === "playlist"
          ? {
              embeds: [
                emd.setDescription(
                  `${client.emoji.playlist} added ${tracks.length} tracks from playlist:  \`${
                    result.playlist.title
                  }\` ${result.playlist.author ? `by ${result.playlist.author}` : ""}`
                ),
              ],
            }
          : {
              embeds: [
                emd.setDescription(
                  `${client.emoji.playlist} added \`${client.utils.trimTitle(tracks[0].info.title)}\` to the queue`
                ),
              ],
            };
      return interaction.editReply(response);
    } catch (err) {
      client.logger.error(err);
    }
  },
};
