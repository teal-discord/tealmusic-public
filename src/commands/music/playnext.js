const { EmbedBuilder, ApplicationCommandOptionType, PermissionsBitField } = require("discord.js");
module.exports = {
  name: "playnext",
  description: "add song in top of the queue.",
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
    aliases: ["pn"],
    usage: "<song name or url>",
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
        required: true,
        type: ApplicationCommandOptionType.String,
        autocomplete: true,
      },
    ],
  },
  messageRun: async (client, message, args) => {
    const response = await Play(client, message, args.join(" "));
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction) => {
    let input = interaction.options.getString("query");
    const response = await Play(client, interaction, input);
    await interaction.followUp(response);
  },
};

async function Play(client, { member, guild, channel }, query) {
  const emd = new EmbedBuilder().setColor(client.botcolor);

  if (!member.voice.channel.permissionsFor(guild.members.me).has(["Connect", "Speak"])) {
    emd.setDescription(`I am missing the \`Connect\` & \`Speak\` Voice Channels permission in your voice chat!`);
    return { embeds: [emd] };
  }
  if (!query) {
    emd.setDescription(`Please enter a song name or url to play!`);
    return { embeds: [emd] };
  }
  const player = await client.manager.createPlayer({
    guildId: guild.id,
    voiceChannelId: member.voice.channelId,
    textChannelId: channel.id,
    selfDeaf: true,
    shardId: guild.shardId,
  });

  let result = await client.searchTrack(query, { requester: member.user }, player);
  const tracks = result.tracks;
  if (!tracks.length)
    return {
      embeds: [
        emd.setDescription(
          `**${client.emoji.error} | No songs found. Try to be as specific as possible by only including song title and artist name!!**`
        ),
      ],
    };

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

  return {
    embeds: [emd.setDescription(`added \`${client.utils.trimTitle(tracks[0].info.title)}\` to the queue`)],
  };
}
