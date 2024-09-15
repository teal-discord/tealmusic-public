const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
module.exports = {
  name: "join",
  description: "Join's your voice channel.",
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
    aliases: ["aaja", "j", "start"],
    usage: "",
    example: "",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
  },
  messageRun: async (client, message, args, player) => {
    const response = await Join(client, message, player);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player) => {
    const response = await Join(client, interaction);
    await interaction.followUp(response);
  },
};

async function Join(client, { member, guild, channel }, player) {
  if (player) {
    if (!guild.members.me.voice.channel) player.connect();
    return {
      embeds: [
        new EmbedBuilder()
          .setColor(client.botcolor)
          .setDescription(`I'm already connected in <#${player.voiceChannelId}> channel!`),
      ],
    };
  } else {
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

    player = await client.manager.createPlayer({
      guildId: guild.id,
      voiceChannelId: member.voice.channelId,
      textChannelId: channel.id,
      selfDeaf: true,
    });
    player.connect();

    let thing = new EmbedBuilder()
      .setColor(client.botcolor)
      .setDescription(`Connected to your voice chat <#${player.voiceChannelId}>.`);
    return { embeds: [thing] };
  }
}
