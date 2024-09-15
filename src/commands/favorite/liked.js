const {
  ApplicationCommandOptionType,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const userDb = require("@models/user");
const paginationEmbed = require("../../helpers/paginationEmbed");

module.exports = {
  name: "liked",
  description: "Manage your favorite liked songs",
  cooldown: 3,
  isPremium: true,
  category: "FAV",
  SameVoiceChannel: false,
  InVoiceChannel: false,
  InBotVC: false,
  Player: false,
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
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "add",
        description: "Add the current playing song to your favorites",
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "remove",
        description: "Remove a song from your favorites",
        options: [
          {
            type: ApplicationCommandOptionType.Integer,
            name: "song",
            description: "The number of the song",
            required: true,
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "list",
        description: "List your favorite songs",
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "play",
        description: "Play one of your favorite songs",
        options: [
          {
            type: ApplicationCommandOptionType.Integer,
            name: "song",
            description: "The number of the song",
            required: false,
          },
        ],
      },
    ],
  },
  messageRun: async (client, message, args, player, data) => {
    const embed = new EmbedBuilder()
      .setColor(client.config.COLORS.RedPink)
      .setAuthor({ name: `Teal Liked Songs commands have been moved to slashcommands` })
      .setDescription(`Consider using \`/liked\` instead of legacy command to get better options availability.`);
    return message.safeReply({ embeds: [embed] });
  },
  interactionRun: async (client, interaction, player, data) => {
    const cmd = interaction.options.getSubcommand();

    let user = await userDb.findOne({
      UserId: interaction.user.id,
    });

    if (!user) {
      user = new userDb({
        UserId: interaction.user.id,
        savedSongs: [],
      });
    }

    if (cmd === "add") {
      let song = player.queue.current;

      if (!song) {
        return interaction.editReply({
          content: "There is no music playing in this guild!",
          ephemeral: true,
        });
      }

      let old = user.savedSongs.find((s) => s.name === song.info.title);

      if (old) {
        return interaction.editReply({
          content: "This song is already in your favorites!",
          ephemeral: true,
        });
      }
      if (user.savedSongs > 999) {
        return await interaction.editReply({
          content: `${client.emoji.error} you are on limit with 999 songs in liked playlist!`,
          ephemeral: true,
        });
      }

      user.savedSongs.push({ name: song.info.title, url: song.info.uri });
      await user.save();

      return interaction.editReply({
        content: `${client.emoji.fav} Added ${song.info.title} to your favorites!`,
        ephemeral: true,
      });
    }
    if (cmd === "remove") {
      let index = interaction.options._hoistedOptions[0].value;

      let old = user.savedSongs.find((s, i) => i === index - 1);

      if (!old)
        return interaction.editReply({
          content: "This song is not in your favorites!",
          ephemeral: true,
        });

      user.savedSongs.splice(index - 1, 1);
      await user.save();

      return interaction.editReply({
        content: `${client.emoji.fav} Removed **${index}. ${old.name}** from your favorites!`,
        ephemeral: true,
      });
    }

    if (cmd === "list") {
      let sng = user.savedSongs;

      if (!sng.length)
        return interaction.editReply({
          content: "You don't have any favorite songs!",
          ephemeral: true,
        });

      const btn1 = new ButtonBuilder().setCustomId("previousbtn").setLabel("Previous").setStyle(ButtonStyle.Secondary);
      const btn2 = new ButtonBuilder().setCustomId("nextbtn").setLabel("Next").setStyle(ButtonStyle.Primary);
      const btn3 = new ButtonBuilder().setLabel("Donate").setURL(client.config.PATREON).setStyle(ButtonStyle.Link);

      let currentEmbedItems = [];
      let embedItemArray = [];
      let pages = [];

      let buttonList = [btn1, btn2, btn3];

      if (sng.length > 10) {
        sng.forEach((s, i) => {
          s.index = i + 1;
          if (currentEmbedItems.length < 10) currentEmbedItems.push(s);
          else {
            embedItemArray.push(currentEmbedItems);
            currentEmbedItems = [s];
          }
        });

        embedItemArray.push(currentEmbedItems);

        embedItemArray.forEach(async (x) => {
          let emb = new EmbedBuilder()
            .setAuthor({
              name: `Favorite Songs | ${interaction.user.username}`,
              iconURL: `${interaction.user.displayAvatarURL()}`,
            })
            .setThumbnail(interaction.user.displayAvatarURL({ size: 2048, dynamic: true }))
            .setColor(client.botcolor)
            .setDescription(`${x.map((s) => `${s.index}. | [${s.name}](${s.url})`).join("\n")}`);

          await pages.push(emb);
        });

        await paginationEmbed(interaction, pages, buttonList);
      } else {
        let emb = new EmbedBuilder()
          .setAuthor({
            name: `Favorite Songs | ${interaction.user.username}`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
          })
          .setColor(client.botcolor)
          .setDescription(`${sng.map((s, i) => `**${i + 1}. | [${s.name}](${s.url})**`).join("\n")}`);

        return interaction.editReply({ embeds: [emb] });
      }
    }

    if (cmd === "play") {
      let index = interaction.options._hoistedOptions[0]?.value;

      if (index) {
        let sng = user.savedSongs.find((s, i) => i + 1 === Number(index));
        if (!player) {
          player = await client.manager.createPlayer({
            guildId: interaction.guild.id,
            voiceChannelId: interaction.member.voice.channel.id,
            textChannelId: interaction.channel.id,
            selfDeaf: true,
          });
          player.connect();
        }
        if (!sng)
          return interaction.editReply({
            content: "This song is not in your favorites!",
            ephemeral: true,
          });

        let result = await client.searchTrack(sng.url, { requester: interaction.user }, player);
        if (!result.tracks.length)
          return interaction.editReply({
            embeds: [emd.setDescription(`**${client.emoji.error} | Track Not available**`)],
          });
        if (!player.queue.tracks || !player.queue.current) {
          player.queue.add(tracks[0]);
          player.play();
        } else {
          let oldQueue = [];
          for (const track of player.queue.tracks) oldQueue.push(track);
          player.queue.splice(0, player.queue.tracks.length);
          player.queue.add(tracks[0]);
          player.queue.add(oldQueue);
        }

        return interaction.editReply({
          content: `${client.emoji.fav} Playing **${sng.name}**!`,
          ephemeral: true,
        });
      } else {
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
            new EmbedBuilder().setColor(client.botcolor).setDescription(`loading your liked songs into current Queue`),
          ],
        });
        for (const track of user.savedSongs) {
          let s = await client.searchTrack(track.url ? track.url : track.name, { requester: interaction.user }, player);
          if (s.loadType === "playlist") {
            await player.queue.add(s.tracks[0]);
            ++count;
          } else if (s.loadType === "track") {
            await player.queue.add(s.tracks[0]);
            ++count;
          } else if (s.loadType === "search") {
            await player.queue.add(s.tracks[0]);
            ++count;
          }
        }
        if (!player.playing) player.play();
        if (player && !player.queue.current) player.destroy(true);
        if (count <= 0 && m)
          return await m.edit({
            embeds: [
              new EmbedBuilder()

                .setColor(client.botcolor)
                .setDescription(`Couldn't add any tracks from your liked songs to the queue.`),
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
    }
  },
};
