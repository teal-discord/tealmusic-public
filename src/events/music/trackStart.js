const { generate } = require("spotify-card");
const { AttachmentBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const prettyMs = require("pretty-ms");
const premiuemDB = require("@models/premium");
const UsersDB = require("@models/premium-users");

const db = require("@models/settings");
const userDb = require("@models/user");
module.exports = {
  name: "trackStart",
  /**
   *
   * @param {Client} client
   * @param {*} player
   * @param {*} track
   */
  execute: async (client, player, track) => {
    await player.set("autoplaytrack", player.queue.current?.info.identifier);

    const guild = client.guilds.cache.get(player.guildId);
    if (!guild) return;
    const channel = await client.channels.cache.get(player.textChannelId);
    if (!channel) return;


    if(!track || !track.info) return;
    if (track.info.sourceName === "flowery-tts") return;
    const data = await db.findOne({ guild: guild.id });

    if (data.announce) {
      if (channel.canSendPlayerEmd()) {
        let canvas_image = await generate({
          cardRadius: 40,
          displayArtist: true,
          adaptiveTextcolor: true,
          songData: {
            title: client.utils.trimTitle(track.info.title) || "Music Track",
            cover: track.info.artworkUrl || client.user.displayAvatarURL({ size: 4096, extension: "png" }),
            artist: track.info.author || "Teal Music",
            platform: "custom",
          },
          fontSizes: {
            title: 60,
            album: 45,
          },
        }).catch(() => {});

        let attachment;
        if (canvas_image)
          attachment = new AttachmentBuilder(canvas_image, {
            name: "music_card.png",
            description: `${client.utils.trimTitle(track.info.title)} music_card`,
          });

        const main = new EmbedBuilder()
          .setAuthor({
            name: "Now playing...",
            iconURL: track.requester.displayAvatarURL({
              size: 4096,
              dynamic: true,
            }),
            link: client.config.SUPPORT_SERVER,
          })
          .setDescription(
            `${client.emoji.a_disk} **${client.utils.trimTitle(track.info.title).toUpperCase()}** \`(${
              track.info.isStream ? "LIVE" : prettyMs(track.info.duration, { colonNotation: true })
            })\` - ${track.requester}`
          )
          .setColor(client.botcolor);
        if (attachment) await main.setImage("attachment://music_card.png");

        if (player.get("autoplay"))
          main.setFooter({
            text: `autoplay is enabled by ${player.get("requester").tag}`,
            iconURL: `${player.get("requester").displayAvatarURL({ size: 4096 })}`,
          });

        if (player.queue.tracks[0]) {
          let nextTitle = player.queue.tracks[0].info.title.toLowerCase();
          main.addFields({
            name: "**Coming up next**",
            value: `${client.emoji.add_song}** Next: ${client.utils.trimTitle(nextTitle)}** - ${
              player.queue.tracks[0].requester
            }`,
          });
        }

        const But1 = new ButtonBuilder()
          .setCustomId("resume")
          .setLabel(`Resume`)
          .setEmoji(client.emoji.resume)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true);
        const But2 = new ButtonBuilder()
          .setCustomId("pause")
          .setLabel(`Pause`)
          .setEmoji(client.emoji.pause)
          .setStyle(ButtonStyle.Secondary);
        const But3 = new ButtonBuilder()
          .setCustomId("skip")
          .setLabel("Skip")
          .setEmoji(client.emoji.forward)
          .setStyle(ButtonStyle.Secondary);
        const But4 = new ButtonBuilder()
          .setCustomId("loop")
          .setLabel(`Looping ${client.utils.capitalizeFirstLetter(player.repeatMode)}`)
          .setEmoji(client.emoji.repeat)
          .setStyle(ButtonStyle.Secondary);

        const butMore = new ButtonBuilder()
          .setCustomId("more")
          .setLabel(`More Options`)
          .setStyle(ButtonStyle.Secondary);
        const butLess = new ButtonBuilder().setCustomId("less").setLabel(`Less Options`).setStyle(ButtonStyle.Danger);

        const But5 = new ButtonBuilder()
          .setCustomId("shuffle")
          .setLabel(`Shuffle`)
          .setEmoji(client.emoji.shuffle)
          .setStyle(ButtonStyle.Secondary);
        const But6 = new ButtonBuilder()
          .setCustomId("stop")
          .setLabel(`Stop`)
          .setEmoji(client.emoji.stop_p)
          .setStyle(ButtonStyle.Secondary);
        const But7 = new ButtonBuilder()
          .setCustomId("autoplay")
          .setLabel(`Autoplay`)
          .setEmoji(client.emoji.radio2)
          .setStyle(player.get("autoplay") ? ButtonStyle.Primary : ButtonStyle.Secondary);
        const But8 = new ButtonBuilder()
          .setCustomId("clear")
          .setLabel(`clear`)
          .setEmoji(client.emoji.clear)
          .setStyle(ButtonStyle.Secondary);
        const But9 = new ButtonBuilder()
          .setCustomId("fav")
          .setLabel(`Favorite`)
          .setEmoji(client.emoji.fav)
          .setStyle(ButtonStyle.Secondary);
        const ButPremium = new ButtonBuilder()
          .setLabel(`Donate`)
          .setEmoji(client.emoji.premium)
          .setURL(client.config.PATREON)
          .setStyle(ButtonStyle.Link);

        if (player.repeatMode !== "off")
          await But4.setStyle(ButtonStyle.Primary).setLabel(`Looping ${player.queue === "queue" ? "Queue" : "Track"}`);

        const row = new ActionRowBuilder().addComponents(But1, But2, But3, But4, But5);
        const row2 = new ActionRowBuilder().addComponents(But6, But7, But8, But9);

        let NowPlaying;
        if (attachment)
          NowPlaying = await channel?.safeSend({
            embeds: [main],
            components: [row, row2],
            files: [attachment],
          });
        else
          NowPlaying = await channel?.safeSend({
            embeds: [main],
            components: [row, row2],
          });
        await player.set("message", NowPlaying);
        const embed = new EmbedBuilder().setColor(client.botcolor);

        if (NowPlaying?.guild) {
          const collector = await NowPlaying.createMessageComponentCollector({
            time: data.pruning ? "" : track.length,
            filter: (x) => {
              if (x.guild.members.me.voice.channel && x.guild.members.me.voice.channelId === x.member.voice.channelId)
                return true;
              else {
                x.reply({
                  content: `connect to ${x.guild.members.me.voice.channel} to use this buttons.`,
                  ephemeral: true,
                });
                return false;
              }
            },
          });
          collector.on("end", (msg, reason) => {
            const rowExpanded = [
              new ActionRowBuilder().addComponents(
                But1.setDisabled(true),
                But2.setDisabled(true),
                But3.setDisabled(true),
                But4.setDisabled(true),
                ButPremium
              ),
            ];
            return NowPlaying.edit({ components: rowExpanded }).catch((e) => {});
          });

          collector.on("collect", async (i) => {
            let p = client.manager.players.get(guild.id);
            let baseData = await client.getGuildData(guild);
            //if (!i.message.id !== player.get("message").id) return;
            if (!p) {
              return collector.stop();
            }
            if (baseData.djCmd.length > 0 && baseData.djCmd.find((x) => x === i.customId)) {
              //Check if there is a Dj Setup
              if (baseData.djRoles.length !== 0) {
                //create the string of all djs and if he is a dj then set it to true
                let isdj = false;

                for (let l = 0; l < baseData.djRoles.length; l++) {
                  if (i.member.roles.cache.has(baseData.djRoles[l])) isdj = true;
                  if (!i.member.roles.cache.get(baseData.djRoles[l])) continue;
                }

                if (
                  !isdj &&
                  p.queue.current.requester.id !== i.member.id &&
                  !i.member.permissions.has("ManageMessages")
                ) {
                  const yiyi = new EmbedBuilder()
                    .setColor(client.botcolor)
                    .setDescription(`You need DJ role (or) \`Manage Messages\` permissions to use this command.`);
                  return i.reply({ embeds: [yiyi], ephemeral: true });
                }
              }
            }

            if (!i.member.guild.members.me.voice.channelId) p.destroy();
            if (i.customId === "resume") {
              if (!player.queue.current) {
                return collector.stop();
              }
              player.resume();
              player.get("message").edit({
                components: [
                  new ActionRowBuilder().addComponents([
                    But1.setDisabled(true).setStyle(ButtonStyle.Secondary),
                    But2.setDisabled(false),
                    But3,
                    But4,
                    butMore.setDisabled(false),
                  ]),
                ],
              });
              i.reply({
                embeds: [
                  embed.setAuthor({
                    name: `resumed the song.`,
                    iconURL: i.member.displayAvatarURL(),
                  }),
                ],
              });
            } else if (i.customId === "pause") {
              if (!player.queue.current) {
                return collector.stop();
              }
              player.pause(true);
              collector.resetTimer();
              player.get("message").edit({
                components: [
                  new ActionRowBuilder().addComponents([
                    But1.setDisabled(false).setStyle(ButtonStyle.Primary),
                    But2.setDisabled(true),
                    But3,
                    But4,
                    butMore.setDisabled(false),
                  ]),
                ],
              });
              i.reply({
                embeds: [
                  embed.setAuthor({
                    name: `Paused the song.`,
                    iconURL: i.member.displayAvatarURL(),
                  }),
                ],
              });
            } else if (i.customId === "skip") {
              if (!player.queue.current) {
                return collector.stop();
              }
              let usersC = i.member.voice.channel.members.filter((member) => !member.user.bot).size;
              let required = Math.ceil(usersC / 2);

              if (!player.get("skipvotes")) player.set("skipvotes", []);

              if (player.get("skipvotes").includes(`${i.member.id}`))
                return i.reply({
                  embeds: [
                    new EmbedBuilder()
                      .setColor(client.botcolor)
                      .setDescription(
                        `<@${i.member.id}> You already voted to skip! (${
                          player.get("skipvotes").length
                        }/${required} people )`
                      ),
                  ],
                });

              player.get("skipvotes").push(`${i.member.id}`);
              if (!(player.get("skipvotes").length >= required) && !(i.member.id == player.queue.current.requester.id))
                i.reply(
                  `<@${i.member.id}> **Skipping?** (${
                    player.get("skipvotes").length
                  }/${required} people) \`/forceskip\` or \`@tealmusic fs\` to force`
                );

              if (player.get("skipvotes").length >= required || i.member.id == player.queue.current.requester.id) {
                player.node.updatePlayer({ guildId: player.guildId, playerOptions: { encodedTrack: null } });
                player.set("skipvotes", []);
                let thing = new EmbedBuilder()
                  .setDescription(
                    `${client.emoji.forward} <@${i.member.id}>  skipped \`${client.utils.trimTitle(
                      player.queue.current.info.title
                    )}\``
                  )
                  .setColor(client.botcolor);
                return i.reply({ embeds: [thing] });
              }
            } else if (i.customId === "loop") {
              if (!player) {
                return collector.stop();
              }

              let hasVoted;
              let guild = await premiuemDB.findOne({
                guildId: i.message.guild.id,
              });
              let user = client.premiumUsers.includes(i.member.id);
              if (!guild && !user)
                hasVoted = await client.topgg.hasVoted(i.member.id).catch((e) => {
                  return true;
                });
              if (!hasVoted && !guild && !user) {
                const embd = new EmbedBuilder()
                  .setColor(client.botcolor)
                  .setDescription(
                    "**[Click here](https://top.gg/bot/972795104525975622/vote) to vote and use this command for the next 12 hours.**\n\n" +
                      "By Buying our [Patreon](https://www.patreon.com/join/lorenzo132) you can bypass this requirement for all members in this server."
                  )
                  .setAuthor({
                    name: "This command requires you to vote.",
                    iconURL: client.user.displayAvatarURL(),
                  });
                const link = new ButtonBuilder()
                  .setLabel(`Vote Me Link`)
                  .setStyle(ButtonStyle.Link)
                  .setEmoji("<:upvote:778416296630157333>")
                  .setURL(client.config.VOTE);
                const patreon = new ButtonBuilder()
                  .setLabel(`Patreon Page Link`)
                  .setStyle(ButtonStyle.Link)
                  .setEmoji("<:patreon:1128604712623677453>")
                  .setURL(client.config.PATREON);
                const row = new ActionRowBuilder().addComponents(link, patreon);
                return await i.reply({
                  embeds: [embd],
                  components: [row],
                  ephemeral: true,
                });
              }

              if (player.repeatMode === "track") {
                await player.setRepeatMode("off");
                let thing = new EmbedBuilder().setColor(client.botcolor).setAuthor({
                  name: `Looping disabled.`,
                  iconURL: i.member.displayAvatarURL(),
                });
                player
                  .get("message")
                  .edit({
                    components: [
                      new ActionRowBuilder().addComponents([
                        But1,
                        But2,
                        But3,
                        But4.setLabel("Looping None").setStyle(ButtonStyle.Secondary),
                        butMore.setDisabled(false),
                      ]),
                    ],
                  })
                  .then(() => i.reply({ embeds: [thing] }));
              } else if (player.repeatMode === "off") {
                await player.setRepeatMode("queue");
                let thing = new EmbedBuilder().setColor(client.botcolor).setAuthor({
                  name: `Looping the queue activated.`,
                  iconURL: i.member.displayAvatarURL(),
                });
                return player
                  .get("message")
                  .edit({
                    components: [
                      new ActionRowBuilder().addComponents([
                        But1,
                        But2,
                        But3,
                        But4.setLabel("Looping Queue").setStyle(ButtonStyle.Primary),
                        butMore.setDisabled(false),
                      ]),
                    ],
                  })
                  .then(() => i.reply({ embeds: [thing] }));
              } else if (player.repeatMode === "queue") {
                await player.setRepeatMode("track");
                let thing = new EmbedBuilder().setColor(client.botcolor).setAuthor({
                  name: `Now looping the current track.`,
                  iconURL: i.member.displayAvatarURL(),
                });

                return player
                  .get("message")
                  .edit({
                    components: [
                      new ActionRowBuilder().addComponents([
                        But1,
                        But2,
                        But3,
                        But4.setLabel("Looping Track").setStyle(ButtonStyle.Primary),
                        butMore.setDisabled(false),
                      ]),
                    ],
                  })
                  .then(() => i.reply({ embeds: [thing] }));
              }
            }
            if (i.customId === "more") {
              if (!player.queue.current) {
                return collector.stop();
              }
              i.deferUpdate();
              const rowExpanded = [
                new ActionRowBuilder().addComponents(But1, But2, But3, But4, But5),
                new ActionRowBuilder().addComponents(But6, But7, But8, ButPremium),
              ];
              return i.message.edit({ components: rowExpanded });
            } else if (i.customId === "less") {
              if (!player.queue.current) {
                return collector.stop();
              }
              const rowLess = [
                new ActionRowBuilder().addComponents(But1, But2, But3, But4, butMore.setDisabled(false)),
              ];

              return await i.message.edit({ components: rowLess });
            } else if (i.customId === "stop") {
              if (!player.queue.current) {
                return collector.stop();
              }
              player.destroy(true);
              let thing = new EmbedBuilder().setColor(client.botcolor).setAuthor({
                name: `Stopped the song.`,
                iconURL: i.member.displayAvatarURL(),
              });
              collector.stop();
              return i.reply({ embeds: [thing] });
            } else if (i.customId === "clear") {
              if (!player.queue.current) {
                return collector.stop();
              }

              player.queue.splice(0, player.queue.tracks.length);

              let thing = new EmbedBuilder().setColor(client.botcolor).setAuthor({
                name: `Cleared the queue.`,
                iconURL: i.member.displayAvatarURL(),
              });
              return i.reply({ embeds: [thing] });
            } else if (i.customId === "autoplay") {
              if (!player.queue.current) {
                return collector.stop();
              }
              player.set("autoplay", !player.get("autoplay"));
              player.set("requester", i.user);
              let thing = new EmbedBuilder().setColor(client.botcolor).setAuthor({
                name: `autoplay is now ${player.get("autoplay") ? "enabled" : "disabled"}.`,
                iconURL: i.member.displayAvatarURL(),
              });
              return player
                .get("message")
                .edit({
                  components: [
                    new ActionRowBuilder().addComponents(But1, But2, But3, But4, But5),
                    new ActionRowBuilder().addComponents(
                      But6,
                      But7.setStyle(player.get("autoplay") ? ButtonStyle.Primary : ButtonStyle.Secondary),
                      But8,
                      ButPremium
                    ),
                  ],
                })
                .then(() => i.reply({ embeds: [thing] }));
            } else if (i.customId === "fav") {
              let user = await userDb.findOne({
                UserId: i.user.id,
              });

              if (!user) {
                user = new userDb({
                  UserId: i.user.id,
                  savedSongs: [],
                });
              }
              if (!track) {
                return await i.reply({
                  content: "There is no music playing in this guild!",
                  ephemeral: true,
                });
              }

              let old = user.savedSongs.find((s) => s.name === track.info.title);

              if (old) {
                const oldtracks = user.savedSongs;

                let counter = 0;
                const newtracks = [];
                for (let i = 0; i < oldtracks.length; i++) {
                  let exists = false;
                  for (j = 0; j < 1000; j++) {
                    if (oldtracks[i].url === track.info.uri || oldtracks[i].name === track.info.title) {
                      exists = true;
                      counter++;
                      break;
                    }
                  }
                  if (!exists) {
                    newtracks.push(oldtracks[i]);
                  }
                }

                user.savedSongs = newtracks;
                await user.save();
                return await i.reply({
                  content: `${client.emoji.fav} Removed ${track.info.title} from your favorites!`,
                  ephemeral: true,
                });
              }
              if (user.savedSongs > 999) {
                return await i.reply({
                  content: `${client.emoji.error} you are on limit with 999 songs in liked playlist!`,
                  ephemeral: true,
                });
              }
              user.savedSongs.push({ name: track.info.title, url: track.info.uri });
              await user.save();

              return await i.reply({
                content: `${client.emoji.fav} Added ${track.info.title} to your favorites!`,
                ephemeral: true,
              });
            } else if (i.customId === "shuffle") {
              if (!player) {
                return collector.stop();
              }
              let hasVoted;
              let guild = await premiuemDB.findOne({
                guildId: i.message.guild.id,
              });
              let user = client.premiumUsers.includes(i.member.id);
              if (!guild && !user)
                hasVoted = await client.topgg.hasVoted(i.member.id).catch((e) => {
                  return true;
                });
              if (!hasVoted && !guild && !user) {
                const embd = new EmbedBuilder()
                  .setColor(client.botcolor)
                  .setDescription(
                    "**[Click here](https://top.gg/bot/972795104525975622/vote) to vote and use this command for the next 12 hours.**\n\n" +
                      "By Buying our [Patreon](https://www.patreon.com/join/lorenzo132) you can bypass this requirement for all members in this server."
                  )
                  .setAuthor({
                    name: "This command requires you to vote.",
                    iconURL: client.user.displayAvatarURL(),
                  });
                const link = new ButtonBuilder()
                  .setLabel(`Vote Me Link`)
                  .setStyle(ButtonStyle.Link)
                  .setEmoji("<:upvote:778416296630157333>")
                  .setURL(client.config.VOTE);
                const patreon = new ButtonBuilder()
                  .setLabel(`Patreon Page Link`)
                  .setStyle(ButtonStyle.Link)
                  .setEmoji("<:patreon:1128604712623677453>")
                  .setURL(client.config.PATREON);

                const row = new ActionRowBuilder().addComponents(link, patreon);
                return await i.reply({
                  embeds: [embd],
                  components: [row],
                  ephemeral: true,
                });
              }
              if (!player.queue.tracks[0]) {
                let thing = new EmbedBuilder()
                  .setColor(client.botcolor)
                  .setDescription(`There's nothing in the queue to shuffle`);
                return i.reply({ embeds: [thing], ephemeral: true });
              }

              let thing = new EmbedBuilder().setColor(client.botcolor).setAuthor({
                name: `Shuffled the queue`,
                iconURL: i.member.displayAvatarURL(),
              });

              await player.queue.shuffle();
              return player
                .get("message")
                .edit({
                  components: [
                    new ActionRowBuilder().addComponents([But1, But2, But3, But4, butMore.setDisabled(false)]),
                  ],
                })
                .then(() => i.reply({ embeds: [thing] }));
            }
          });
        } else {
          return;
        }
      }
    }
  },
};
