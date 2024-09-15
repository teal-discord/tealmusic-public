const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder } = require("discord.js");

const db = require("@models/user");

module.exports = {
  name: "spotify",
  description: "directly plays your public playlists.",
  cooldown: 6,
  isPremium: false,
  category: "PREMIUM",
  botPermissions: [],
  userPermissions: [],
  SameVoiceChannel: true,
  InVoiceChannel: true,
  InBotVC: true,
  Player: true,
  ActivePlayer: false,
  command: {
    enabled: true,
    aliases: ["sp"],
    usage: "spotify",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
  },

  messageRun: async (client, message, args, player) => {
    const embed = new EmbedBuilder()
      .setColor(client.config.COLORS.RedPink)
      .setAuthor({ name: `This Teal command is only available on slashcommands` })
      .setDescription(`Consider using \`/spotify\` instead of legacy command to get better options availability.`);
    return message.safeReply({ embeds: [embed] });
  },
  interactionRun: async (client, interaction, player) => {
    try{
    const response = await Spotify(client, player, interaction.member.user);
    if (response?.content) return interaction.followUp(response);

    const sentMsg = await interaction.followUp({
      embeds: [response.embeds[0]],
      components: [response?.components[0][0], response?.components[1]],
    });
 
    return waiter(sentMsg, interaction.member.user, player, response.embeds, response.components[0]);
  } catch (e) { console.log(e); }
  },
};

async function Spotify(client, player, user) {
  try {
  const userData = await db.findOne({ UserId: user.id });

  if (!userData?.spotifyUId) return { content: `You need to set spotify User ID using \`/spotifyid\` command.` };

  const pl = await client.spotifyApi.getUserPlaylists(userData.spotifyUId).then((x) => x.body.items);

  if (!pl?.length) return { content: "You don't have any public playlists." };
  if (pl.length >= 1) {
    const pllist = new Array();
    const mnlist = new Array();
    for (let i = 0; i < pl.length; i += 10) {
      mnlist.push(pl.slice(i, i + 10));
      pllist.push(
        pl
          .slice(i, i + 10)
          .map(
            (t, index) => `\`${i + ++index}.\` [${t.name}](${t.external_urls.spotify}) (\`${t.tracks.total}\` Songs)`
          )
          .join(`\n\n`)
      );
    }

    const embeds = new Array();
    const menus = new Array();
    for (let i = 0; i < pllist.length; i++) {
      const options = new Array();
      const tracks = mnlist[i];
      const tempmenu = new StringSelectMenuBuilder()
        .setMaxValues(1)
        .setPlaceholder(`Please Select A Playlist`)
        .setCustomId(`w`);

      for (let i = 0; i < tracks.length; i += 1) {
        options.push({
          label: tracks[i].name,
          description: `[${tracks[i].tracks.total} Songs]`,
          value: tracks[i].external_urls.spotify,
        });
      }
      tempmenu.addOptions(options);

      const menurow = new ActionRowBuilder().addComponents([tempmenu]);
      menus.push(menurow);

      embeds.push(
        new EmbedBuilder()
          .setAuthor({
            name: `${user.username}'s Public Spotify playlists`,
            iconURL: client.user.displayAvatarURL({ dynamic: true }),
          })
          .setColor(client.botcolor)
          .setDescription(pllist[i])
      );
    }
    let components = [];
    components.push(
      new ButtonBuilder()
        .setCustomId("previousBtn")
        .setStyle(2)
        .setDisabled(embeds.length >= 1 ? false : true)
        .setLabel("Back"),
      new ButtonBuilder()
        .setCustomId("nextBtn")
        .setStyle(2)
        .setDisabled(embeds.length >= 1 ? false : true)
        .setLabel("Next")
    );
    let buttonsRow = new ActionRowBuilder().addComponents(components);

    return {
      embeds: embeds,
      components: [menus, buttonsRow],
    };
  }
} catch (e) {
  console.log(e);
}
}

const waiter = async (msg, user, player, embeds, menus) => {
  const collector = msg.channel.createMessageComponentCollector({
    filter: (reactor) => reactor.user.id === user.id && msg.id === reactor.message.id,
    idle: 30 * 1000,
    dispose: true,
    time: 5 * 60 * 1000,
  });

  let arrEmbeds = embeds;
  let currentPage = 0;
  let buttonsRow = msg.components[1];

  collector.on("collect", async (response) => {
    if (!["w", "previousBtn", "nextBtn"].includes(response.customId)) return;
    await response.deferUpdate();

    switch (response.customId) {
      case "w":
        const cat = response.values[0];

        response = await spotifyPlay(msg.client, cat, player, user);
        currentPage = 0;

        msg.editable && (await msg.edit(response));
        break;

      case "previousBtn":
        if (currentPage !== 0) {
          --currentPage;
          msg.editable &&
            (await msg.edit({ embeds: [arrEmbeds[currentPage]], components: [menus[currentPage], buttonsRow] }));
        }
        break;

      case "nextBtn":
        if (currentPage < arrEmbeds.length - 1) {
          currentPage++;
          msg.editable &&
            (await msg.edit({ embeds: [arrEmbeds[currentPage]], components: [menus[currentPage], buttonsRow] }));
        }
        break;
    }
  });
};

async function spotifyPlay(client, playlist, player, user) {
  const res = await client.searchTrack(playlist, { requester: user }, player);
  const embed = new EmbedBuilder()
    .setColor(client.botcolor)
    .setDescription(
      `[${res.tracks.length} tracks] ${res.playlist?.title} by ${res.playlist?.author} has been added to the queue.`
    )
    .setThumbnail(res.playlist?.thumbnail)
    .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) });

  await player.queue.add(res.tracks);
  if (!player.playing) await player.play();

  return { embeds: [embed], components: [] };
}
