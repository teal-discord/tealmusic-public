const { EmbedBuilder, ApplicationCommandOptionType, PermissionsBitField } = require("discord.js");
const fetch = require("node-fetch");
module.exports = {
  name: "speak",
  description: "speaks in voice chat",
  cooldown: 5,
  isPremium: false,
  category: "OWNER",
  botPermissions: [],
  userPermissions: [],
  SameVoiceChannel: true,
  InVoiceChannel: true,
  InBotVC: true,
  command: {
    enabled: true,
    aliases: ["say"],
    usage: "<text>",
    minArgsCount: 1,
    subcommands: [],
  },
  slashCommand: {
    enabled: false,
    ephemeral: false,
    options: [
      {
        name: "text",
        description: "enter song name or url",
        required: true,
        type: ApplicationCommandOptionType.String,
        autocomplete: true,
      },
    ],
  },
  messageRun: async (client, message, args) => {
    let query = args.join(" ");
    let { member, guild, channel } = message;
    const emd = new EmbedBuilder().setColor(client.botcolor);

    if (!guild.members.me.permissionsIn(member.voice.channel).has(["Connect", "Speak", "ViewChannel"])) {
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
      emd.setDescription(`Please enter a valid text.`);
      return message.safeReply({ embeds: [emd] });
    }

    const player = await client.manager.createPlayer({
      guildId: guild.id,
      voiceChannelId: member.voice.channelId,
      textChannelId: channel.id,
      selfDeaf: true,
    });
    player.connect();

    try {
      let result = await client.searchTrack(query, { requester: member.user, engine: "ftts" }, player);
      const tracks = result.tracks;
      if (!tracks.length)
        return message.safeReply({
          embeds: [
            emd.setDescription(
              `**${client.emoji.error} | No songs found. Try to be as specific as possible by only including song title and artist name!!**`
            ),
          ],
        });
      player.queue.add(tracks[0]);
      if (!player.playing) player.play();
      const response = {
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
};
