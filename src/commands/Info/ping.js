const { EmbedBuilder } = require("discord.js");
const { connection, models } = require("mongoose");

module.exports = {
  name: "ping",
  description: "shows bot latency",
  cooldown: 6,
  isPremium: false,
  category: "INFO",
  botPermissions: [],
  userPermissions: [],
  command: {
    enabled: true,
    aliases: ["latency"],
    usage: "latency",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [],
  },
  messageRun: async (client, message, args, player, data) => {
    const time = Date.now();

    const database = await GetdbStats();

    let content =
      `* ${client.emoji.bot} **Bot Latency**:\n` +
      ` * API: \`${message.guild.shard.ping / 2}ms\` \n` +
      ` * Message: \`${(time - message.createdAt) / 2}ms\` \n` +
      `* ${client.emoji.database} **Database**\n` +
      ` * Latency: \`${database.ping}ms\` \n` +
      ` * Entries: \`${database.entries}\` \n`;

    if (player) voice = await message.guild.channels.fetch(player.voiceChannelId);

    if (player)
      content +=
        `* **Audio transmit**: \`${player.ping.lavalink}ms\`\n` +
        `* ${client.emoji.voice_channel}**Voice**\n` +
        ` * Latency: \`${player.ping.ws}ms\` \n` +
        ` * For Region: \`${voice.rtcRegion ? voice.rtcRegion : "Automatic"}\` \n`;
    const embed = new EmbedBuilder().setColor(client.botcolor).setDescription(content).setTimestamp();

    await message.safeReply({ embeds: [embed] });
  },
  interactionRun: async (client, interaction, player) => {
    const time = Date.now();
    const database = await GetdbStats();

    let content =
      `* ${client.emoji.bot} **Bot Latency**:\n` +
      ` * API: \`${interaction.guild.shard.ping / 2}ms\`\n` +
      ` * Message: \`${(time - interaction.createdAt) / 2}ms\`\n` +
      `* ${client.emoji.database} **Database**:\n` +
      ` * Latency: \`${database.ping}ms\` \n` +
      ` * Entries: \`${database.entries}\` \n`;

    if (player) voice = await interaction.guild.channels.fetch(player.voiceChannelId);

    if (player)
      content +=
        `* **Audio transmit**: \`${player.ping.lavalink}ms\`` +
        `* ${client.emoji.voice_channel}**Voice**:\n` +
        ` * Voice Latency: \`${player.ping.ws}ms\` \n` +
        ` * For Region: \`${voice.rtcRegion ? voice.rtcRegion : "Automatic"}\` \n`;

    const embed = new EmbedBuilder().setColor(client.botcolor).setDescription(content).setTimestamp();

    await interaction.followUp({ embeds: [embed] });
  },
};

async function GetdbStats() {
  const Values = Object.values(models);

  const entries = await Values.reduce(async (accumulator, model) => {
    const counts = await model.countDocuments();
    return (await accumulator) + counts;
  }, Promise.resolve(0));

  const ping = await connection.db
    .admin()
    .ping()
    .then((x) => x.ok);

  return { entries, ping };
}
