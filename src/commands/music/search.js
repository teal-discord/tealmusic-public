const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ApplicationCommandOptionType,
  ComponentType,
} = require("discord.js");
const prettyMs = require("pretty-ms");

module.exports = {
  name: "search",
  description: "search for songs.",
  cooldown: 6,
  isPremium: false,
  category: "MUSIC",
  SameVoiceChannel: true,
  InVoiceChannel: true,
  InBotVC: true,
  Player: false,
  ActivePlayer: false,
  botPermissions: ["SendMessages", "ReadMessageHistory", "EmbedLinks"],
  userPermissions: [],
  command: {
    enabled: true,
    aliases: [],
    usage: "<song-name>",
    minArgsCount: 1,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "query",
        description: "song to search",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
  messageRun: async (client, message, args, player, data) => {
    const query = args.join(" ");
    const response = await search(client, message, query, player);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    const query = interaction.options.getString("query");
    const response = await search(client, interaction, query, player);
    await interaction.followUp(response);
  },
};

async function search(client, { member, guild, channel }, query, player) {
  let embed = new EmbedBuilder().setColor(client.botcolor);

  const res = await client.searchTrack(query, { engine: "spotify", requester: member.user }, player);

  let tracks;
  if (!res.tracks.length) {
    embed.setDescription("**Couldn't search any tracks with that query**");
    return { embeds: [embed] };
  }

  let max = 10;
  if (res.tracks.length < max) max = res.tracks.length;

  const emojiarray = [
    "<:zero:929332851609059328>",
    "<:one:929332851630018600>",
    "<:two:929332851491622932>",
    "<:three:929332851516784660>",
    "<:four:929332851676168193>",
    "<:five:929332851592298506>",
    "<:six:929332851642597376>",
    "<:seven:929332851797815316>",
    "<:eight:929332851630034944>",
    "<:nine:929332851437084693>",
  ];

  const results = res.tracks.slice(0, max);
  const options = results.map((result, index) => ({
    label: client.utils.trimTitle(result.info.title),
    value: index.toString(),
    emoji: emojiarray[index],
  }));

  const menuRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("search-results")
      .setPlaceholder("Choose Search Results")
      .setMaxValues(max)
      .addOptions(...options, {
        value: `Cancel`,
        label: `Cancel`,
        description: `Cancel the Search Menu`,
        emoji: "<:error:980786537270743101>",
      })
  );

  const tempEmbed = new EmbedBuilder()
    .setColor(client.botcolor)
    .setAuthor({ name: "Search Results" })
    .setDescription(`Please select the songs you wish to add to queue`);

  const sentMsg = await channel.send({
    embeds: [tempEmbed],
    components: [menuRow],
  });

  try {
    const response = await channel.awaitMessageComponent({
      filter: (reactor) => reactor.message.id === sentMsg.id && reactor.user.id === member.id,
      idle: 30 * 1000,
      componentType: ComponentType.StringSelect,
    });

    await sentMsg.delete().catch(() => {});

    if (!response) {
      embed.setDescription(`You took too long to select the songs`);
      return { embeds: [embed] };
    }

    if (response.customId !== "search-results") return;
    if (response.values[0] === "Cancel") {
      await sentMsg.delete().catch((e) => {});
      embed.setDescription(`Cancelled the your Search request`);
      return { embeds: [embed] };
    }
    const toAdd = [];
    response.values.forEach((v) => toAdd.push(results[v]));

    // Only 1 song is selected
    if (toAdd.length === 1) {
      tracks = [toAdd[0]];
      embed.setAuthor({ name: "Added 1 Song to queue" });
    } else {
      tracks = toAdd;
      embed
        .setDescription(`Added ${toAdd.length} songs to queue`)
        .setFooter({ text: `Requested By: ${member.user.username}` });
    }
  } catch (err) {
    console.log(err);
    await sentMsg.delete().catch(() => {});
    embed.setDescription(`Failed to register your response`);
    return { embeds: [embed] };
  }

  if (!player?.voiceChannelId) {
    player = await client.manager.createPlayer({
      guildId: guild.id,
      voiceChannelId: member.voice.channelId,
      textChannelId: channel.id,
      selfDeaf: true,
    });
    player.connect();
  }

  // do queue things
  const started = player.playing || player.paused;
  player.queue.add(tracks);
  if (!started) {
    await player.play();
  }

  return { embeds: [embed] };
}
