const {
  ApplicationCommandOptionType,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
const db = require("@models/playlists");
const lodash = require("lodash");
const prettyms = require("pretty-ms");

module.exports = {
  name: "playlist",
  description: "custom playlist",
  cooldown: 7,
  isPremium: true,
  category: "PLAYLIST",
  SameVoiceChannel: true,
  InVoiceChannel: true,
  InBotVC: true,
  Player: true,
  ActivePlayer: false,
  botPermissions: [],
  userPermissions: [],
  command: {
    enabled: true,
    aliases: ["pl", "playlists"],
    usage: "",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "create",
        description: "create a playlist",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            description: "give a name for your playlist",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "removedupes",
        description: "remove removedupes from a playlist",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            autocomplete: true,
            description: "give a name for your playlist",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "delete",
        description: "delete a your playlist",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            autocomplete: true,
            description: "name of the playlist you want to delete",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "play",
        description: "play your playlist",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            autocomplete: true,
            description: "name of the playlist you want to play",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "view",
        description: "view your playlist",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            description: "name of the playlist you want to view details",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
          },
        ],
      },
      {
        name: "list",
        description: "list your playlists",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "removetrack",
        description: "removetrack from your playlists",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            description: "name of the playlist you want to view details",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
          },
          {
            name: "track",
            description: "trackID of the track you want to remove from your playlist",
            type: ApplicationCommandOptionType.Number,
            required: true,
          },
        ],
      },

      {
        name: "savecurrent",
        description: "save current playing in your playlist",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            description: "name of the playlist you want to save current playing song",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
          },
        ],
      },
      {
        name: "savequeue",
        description: "save current queue in your playlists",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            description: "name of the playlist you want to save current playing queue",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
          },
        ],
      },
    ],
  },
  messageRun: async (client, message, args, player, data) => {
    const embed = new EmbedBuilder()
      .setColor(client.config.COLORS.RedPink)
      .setAuthor({ name: `Teal playlists commands have been moved to slashcommands` })
      .setDescription(`Consider using \`/playlist\` instead of legacy command to get better options availability.`);
    return message.safeReply({ embeds: [embed] });
  },
  interactionRun: async (client, interaction, player, data) => {
    const type = interaction.options.getSubcommand();
    let Name = interaction.options.getString("name");
    let Options = interaction.options.getNumber("track");

    if (!type)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.botcolor)
            .setFooter({
              text: interaction.member.tag,
              iconURL: interaction.member.author.displayAvatarURL({ dynamic: true }),
            })

            .setTitle(`You didn't entered a type`).setDescription(`
                ${await client.application.commands.fetch().then((x) =>
                  x
                    .filter((e) => e.name === "playlist")
                    .first()
                    .options.map((c) => `${c.name}`)
                    .join(` \n `)
                )}`),
        ],
      });

    /*if (!Name)
             return message.reply({
               embeds: [new EmbedBuilder()
                 .setColor('client.botcolor')
                 .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({dynamic: true})})
                 .setTitle(`You didn't entered a name `)
                 .setDescription(`\n\nName Information: \`it Can be anything with maximum of 10 Letters\``)
               ]
             });
       */
    switch (type) {
      case `create`:
        {
          if (Name.length > 10) {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor(client.botcolor)
                  .setDescription("Playlist Name Cant Be Greater Than 10 Charecters"),
              ],
            });
          }
          let data = await db.find({
            UserId: interaction.user.id,
            PlaylistName: Name,
          });

          if (data.length > 0) {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor(client.botcolor)

                  .setDescription(`This playlist already Exists!`),
              ],
            });
          }

          let fetchList = await db.find({
            userID: interaction.user.id,
          });
          if (fetchList.length > 10) {
            const limit = new EmbedBuilder()
              .setColor(client.botcolor)
              .setDescription(`you are on limit with 10 playlists`);
            return interaction.editReply({ embeds: [limit] });
          }

          const player = client.manager.players.get(interaction.guild.id);

          if (!player || !player.queue.current) {
            const de = new EmbedBuilder().setColor(client.botcolor).setDescription(`There is nothing playing`);
            return interaction.editReply({ embeds: [de] });
          }
          if (!player.queue.current) {
            const dew = new EmbedBuilder().setColor(client.botcolor).setDescription(`There is nothing playing`);
            return interaction.editReply({ embeds: [dew] });
          }

          const song = player.queue.current;
          const tracks = player.queue.tracks;

          let oldSong = data.Playlist;
          if (!Array.isArray(oldSong)) oldSong = [];
          const newSong = [];
          if (player.queue.current) {
            newSong.push({
              title: song.info.title,
              uri: song.info.uri,
              author: song.info.author,
              duration: song.info.duration,
            });
          }
          for (const track of tracks)
            newSong.push({
              title: track.info.title,
              uri: track.info.uri,
              author: track.info.author,
              duration: track.info.duration,
            });
          const playlist = oldSong.concat(newSong);

          const newData = new db({
            UserName: interaction.user.tag,
            UserId: interaction.user.id,
            PlaylistName: Name,
            Playlist: playlist,
            CreatedOn: Math.round(Date.now() / 1000),
          });
          await newData.save();

          const embed = new EmbedBuilder()
            .setDescription(`Successfully created playlist \`${Name}\``)
            .setColor(client.botcolor);

          interaction.editReply({ embeds: [embed] });
          /*
                 await db.updateOne(
                   {
                     UserId: message.author.id,
                     PlaylistName: Name,
                   },
                   {
                     $set: {
                       Playlist: playlist,
                     },
                   },
                 );
       */
        }
        break;

      case "delete":
        {
          const data = await db.findOne({ UserId: interaction.user.id, PlaylistName: Name });
          if (!data) {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor(client.botcolor)

                  .setDescription(`You don't have a playlist with name **${Name}** `),
              ],
            });
          }
          if (data.length == 0) {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor(client.botcolor)

                  .setDescription(`You don't have a playlist with name **${Name}** `),
              ],
            });
          }
          await data.deleteOne();
          const embed = new EmbedBuilder()
            .setColor(client.botcolor)

            .setDescription(`Successfully deleted playlist \`${Name}\``);
          return interaction.editReply({ embeds: [embed] });
        }

        break;

      case "play":
        {
          const data = await db.findOne({ UserId: interaction.user.id, PlaylistName: Name });

          let name = Name;

          if (!data) {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor(client.botcolor)

                  .setDescription(`Playlist not found. \n\nDo \`/playlist list\` To see your Playlists`),
              ],
            });
          }
          if (!player) {
            player = await client.manager.createPlayer({
              guildId: interaction.guild.id,
              voiceChannelId: interaction.member.voice.channel.id,
              textChannelId: interaction.channel.id,
              selfDeaf: true,
            });
            player.connect();
          }
          let count = 0;
          const m = await interaction.editReply({
            embeds: [
              new EmbedBuilder()

                .setColor(client.botcolor)
                .setDescription(`loading playlist **${data.PlaylistName}** into current Queue`),
            ],
          });

          for (const track of data.Playlist) {
            let s = await client.searchTrack(
              track.uri ? track.uri : track.title,
              { requester: interaction.user },
              player
            );
            if (s.loadType === "playlist") {
              await player.queue.add(s.tracks[0]);
              if (!player.playing) player.play();
              ++count;
            } else if (s.loadType === "track") {
              await player.queue.add(s.tracks[0]);
              if (!player.playing) player.play();
              ++count;
            } else if (s.loadType === "search") {
              await player.queue.add(s.tracks[0]);
              if (!player.playing) player.play();
              ++count;
            }
            if (count === 999) {
              break;
            }
          }
          if (!player.playing) player.play();
          if (player && !player.queue.current) player.destroy(true);
          if (count <= 0 && m)
            return await m.edit({
              embeds: [
                new EmbedBuilder()

                  .setColor(client.botcolor)
                  .setDescription(`Couldn't add any tracks from your playlist **${name}** to the queue.`),
              ],
            });
          if (m)
            return await m.edit({
              embeds: [
                new EmbedBuilder()
                  .setColor(client.botcolor)
                  .setDescription(`Loaded **${count}** tracks into current Queue.`),
              ],
            });
        }
        break;

      case "list":
        {
          let data = await db.find({ UserId: interaction.user.id });
          if (!data.length) {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor(client.botcolor)

                  .setDescription(`You Do Not Have Any Playlist`),
              ],
            });
          }
          let list = data.map(
            (x, i) =>
              `\`${++i}\` - **${x.PlaylistName}** | it has \`${x.Playlist.length}\` Tracks | Created on <t:${
                x.CreatedOn
              }:d>`
          );

          const pages = lodash.chunk(list, 15).map((x) => x.join("\n\n"));
          let page = 0;
          let List = list.length;

          const embeds = new EmbedBuilder()
            .setAuthor({
              name: `${interaction.user.tag}'s playlist`,
              iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
              url: client.botinvite,
            })
            .setDescription(pages[page])
            .setFooter({ text: `Playlist (${List} / 5)` })
            .setColor(client.botcolor);
          return await interaction.editReply({ embeds: [embeds] });
        }
        break;
      case "removetrack":
      case "remove":
        {
          const data = await db.findOne({ UserId: interaction.user.id, PlaylistName: Name });
          if (!data) {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()

                  .setColor(client.botcolor)
                  .setDescription(`You don't have a playlist with **${Name}** name`),
              ],
            });
          }
          if (data.length == 0) {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor(client.botcolor)
                  .setDescription(`You don't have a playlist with **${Name}** name`),
              ],
            });
          }

          if (!Options || isNaN(Options)) {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()

                  .setColor(client.botcolor)
                  .setDescription(
                    `You didn't entered track number \n\nSee all your Tracks with \`/playlist view ${Name}\``
                  ),
              ],
            });
          }
          let tracks = data.Playlist;
          if (Number(Options) >= tracks.length || Number(Options) < 0) {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()

                  .setColor(client.botcolor)
                  .setDescription(
                    `Your provided track number is out of the range (\`0\` - ${
                      tracks.length - 1
                    })\n\nSee all your tracks with \`/playlist view ${Name}\``
                  ),
              ],
            });
          }
          await db.updateOne(
            {
              UserId: interaction.user.id,
              PlaylistName: Name,
            },
            {
              $pull: {
                Playlist: data.Playlist[Options],
              },
            }
          );
          const embed = new EmbedBuilder()
            .setColor(client.botcolor)

            .setDescription(`Removed **${tracks[Options].title}** from playlist \`${Name}\``);
          return interaction.editReply({ embeds: [embed] });
        }
        break;
      case `view`:
      case `details`:
        {
          const data = await db.findOne({ UserId: interaction.user.id, PlaylistName: Name });
          if (!data) {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor(client.botcolor)
                  .setDescription(`You don't have a playlist with name **${Name}**`),
              ],
            });
          }
          let tracks = data.Playlist.map(
            (x, i) =>
              `\`${+i}\` - ${x.title && x.uri ? `[${x.title}](${x.uri})` : `${x.title}`}${
                x.duration ? ` - \`${prettyms(Number(x.duration), { colonNotation: true })}\`` : ""
              }`
          );
          let pname = data.PlaylistName;
          let plist = data.Playlist.length;

          const pages = lodash.chunk(tracks, 11).map((x) => x.join("\n"));
          let page = 0;
          const embed = new EmbedBuilder()
            .setAuthor({
              name: `${interaction.user.username}'s playlist`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setColor(client.botcolor)
            .setDescription(`Playlist **${pname}** **(${plist})** Tracks \n\n${pages[page]}`);
          if (pages.length <= 1) {
            return await interaction.editReply({ embeds: [embed] });
          } else {
            let previousbut = new ButtonBuilder()
              .setCustomId("Previous")
              .setEmoji("<:left:932917123129442324>")
              .setStyle(ButtonStyle.Secondary);

            let nextbut = new ButtonBuilder()
              .setCustomId("Next")
              .setEmoji("<:right:932917123158802472>")
              .setStyle(ButtonStyle.Secondary);

            let stopbut = new ButtonBuilder()
              .setCustomId("home")
              .setEmoji("<a:Emoji_Tree:932913592506929152>")
              .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder().addComponents(previousbut, stopbut, nextbut);

            const m = await interaction.editReply({ embeds: [embed], components: [row] });

            const collector = m.createMessageComponentCollector({
              filter: (b) => (b.user.id === interaction.user.id ? true : false && b.deferUpdate().catch(() => {})),
              time: 120000 * 5,
              idle: (120000 * 5) / 2,
            });

            collector.on("end", async () => {
              if (!m) return;
              await m.edit({
                components: [
                  new ActionRowBuilder().addComponents(
                    previousbut.setDisabled(true),
                    stopbut.setDisabled(true),
                    nextbut.setDisabled(true)
                  ),
                ],
              });
            });

            collector.on("collect", async (b) => {
              if (!b.deferred) await b.deferUpdate().catch(() => {});

              if (b.customId === "Previous") {
                page = page - 1 < 0 ? pages.length - 1 : --page;
                if (!m) return;

                embed.setDescription(`Playlist **${pname}** **(${plist})** Tracks \n\n${pages[page]}`);
                return await m.edit({ embeds: [embed] });
              }
              if (b.customId === "Next") {
                page = page + 1 >= pages.length ? 0 : ++page;
                if (!m) return;

                embed.setDescription(`Playlist **${pname}** **(${plist})** Tracks \n\n${pages[page]}`);
                return await m.edit({ embeds: [embed] });
              }
              if (b.customId === "home") {
                currentPage = 0;
                embed.setDescription(`Playlist **${pname}** **(${plist})** Tracks \n\n${pages[currentPage]}`);
                return await m.edit({ embeds: [embed] });
              }
            });
          }
        }
        break;
      case "savecurrent":
        {
          const data = await db.findOne({ UserId: interaction.user.id, PlaylistName: Name });
          const player = client.manager.players.get(interaction.guild.id);

          if (!player.queue.current) {
            let thing = new EmbedBuilder()
              .setAuthor({
                name: `${interaction.user.username}`,
                iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}`,
              })
              .setColor(client.botcolor)
              .setDescription(`There's nothing playing in this server`);
            return interaction.editReply({ embeds: [thing] });
          }
          if (!data) {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor(client.botcolor)

                  .setDescription(`You don't have a playlist with name **${Name}** `),
              ],
            });
          }
          if (data.length == 0) {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()

                  .setColor(client.botcolor)
                  .setDescription(`You don't have a playlist with name **${Name}** `),
              ],
            });
          }
          const song = player.queue.current;
          let oldSong = data.Playlist;
          if (!Array.isArray(oldSong)) oldSong = [];
          oldSong.push({
            title: song.info.title,
            uri: song.info.uri,
            author: song.info.author,
            duration: song.info.length,
          });
          await db.updateOne(
            {
              UserId: interaction.user.id,
              PlaylistName: Name,
            },
            {
              $push: {
                Playlist: {
                  title: song.info.title,
                  uri: song.info.uri,
                  author: song.info.author,
                  duration: song.info.length,
                },
              },
            }
          );
          const embed = new EmbedBuilder()
            .setColor(client.botcolor)
            .setDescription(`Added [${song.info.title.substr(0, 256)}](${song.uri}) in playlist \`${Name}\``);

          return interaction.editReply({ embeds: [embed] });
        }
        break;
      case "removedupes":
        {
          const data = await db.findOne({ UserId: interaction.member.user.id, PlaylistName: Name });
          if (!data) {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor(client.botcolor)

                  .setDescription(
                    `Playlist not found. Please enter the correct playlist name \n\nuse : \`/playlists list\` To see your Playlists`
                  ),
              ],
            });
          }
          if (data.length == 0) {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor(client.botcolor)
                  .setDescription(`You don't have a playlist with **${Name}** name`),
              ],
            });
          }
          const oldtracks = data.Playlist;

          let counter = 0;
          const newtracks = [];
          for (let i = 0; i < oldtracks.length; i++) {
            let exists = false;
            for (j = 0; j < newtracks.length; j++) {
              if (oldtracks[i].url === newtracks[j].url) {
                exists = true;
                counter++;
                break;
              }
            }
            if (!exists) {
              newtracks.push(oldtracks[i]);
            }
          }

          data.Playlist = newtracks;
          await data.save();
          return interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.botcolor)
                .setDescription(`Removed **${counter}** duplicate tracks from **${Name}** playlist`),
            ],
          });
        }
        break;

      case "savequeue":
        {
          const data = await db.findOne({ UserId: interaction.member.user.id, PlaylistName: Name });
          const player = client.manager.players.get(interaction.guild.id);

          if (!player.queue.current) {
            let thing = new EmbedBuilder()
              .setAuthor({
                name: `${interaction.user.username}`,
                iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}`,
              })
              .setColor(client.botcolor)
              .setDescription(`There's nothing playing in this server`);
            return interaction.editReply({ embeds: [thing] });
          }
          if (!data) {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor(client.botcolor)
                  .setDescription(`Playlist not found. Please enter the correct playlist name`),
              ],
            });
          }
          if (data.length == 0) {
            return interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor(client.botcolor)
                  .setDescription(`Playlist not found. Please enter the correct playlist name`),
              ],
            });
          }

          const song = player.queue.current;
          const tracks = player.queue.tracks;

          let oldSong = data.Playlist;
          if (!Array.isArray(oldSong)) oldSong = [];
          const newSong = [];
          if (player.queue.current) {
            newSong.push({
              title: song.info.title,
              uri: song.info.uri,
              author: song.info.author,
              duration: song.info.duration,
            });
          }
          for (const track of tracks)
            newSong.push({
              title: track.info.title,
              uri: track.info.uri,
              author: track.info.author,
              duration: track.info.duration,
            });
          const playlist = oldSong.concat(newSong);
          await db.updateOne(
            {
              UserId: interaction.user.id,
              PlaylistName: Name,
            },
            {
              $set: {
                Playlist: playlist,
              },
            }
          );
          const embed = new EmbedBuilder()
            .setDescription(`Added \`${playlist.length - oldSong.length}\` tracks in playlist \`${Name}\``)
            .setColor(client.botcolor);
          return interaction.editReply({ embeds: [embed] });
        }
        break;
      default:
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.botcolor)

              .setTitle(`You didn't entered a valid type`)
              .setDescription(
                `Available Types:\n\`create\`, \`delete\`, \`view\`, \`list\`, \`load\`, \`removetrack\`, \`addcurrent\`, \`savequeue\``
              ),
          ],
        });
        break;
    }
  },
};
