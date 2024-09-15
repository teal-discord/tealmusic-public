const { EmbedBuilder } = require("discord.js");
const osu = require("node-os-utils");

module.exports = {
  name: "botstats",
  description: "shows bot stats.",
  cooldown: 10,
  isPremium: false,
  category: "INFO",
  botPermissions: [],
  userPermissions: [],
  command: {
    enabled: true,
    aliases: ["stats"],
    usage: "botstats",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [],
  },
  messageRun: async (client, message) => {
    const response = await botStats(client, message);
    await message.channel.safeSend(response);
  },
  interactionRun: async (client, interaction) => {
    const response = await botStats(client, interaction);
    await interaction.followUp(response);
  },
};
async function botStats(client, message) {
  const embed = new EmbedBuilder().setColor(client.botcolor);
  embed.setAuthor({
    name: client.user.tag,
    iconURL: client.user.displayAvatarURL(),
  });
  embed.setDescription(`* [Support Server](${client.config.SUPPORT_SERVER}) | [Bot Invite](${client.botinvite})`);
  embed.setTimestamp();

  let totalRam = 0;
  let avgCPU = 0;
  let count2 = 0;
  client.manager.nodeManager.nodes.forEach((e) => {
    totalRam += e.stats?.memory.used ?? 0;
    avgCPU += e.stats?.cpu.systemLoad ?? 0;
    count2++;
  });
  avgCPU /= count2;

  const Ncpu = `${osu.cpu.model()}`;
  const promises = [
    osu.mem.totalMem(),
    client.shard
      .broadcastEval(() => process.memoryUsage().rss)
      .then((results) => results.reduce((prev, val) => prev + val, 0)),
    client.shard.broadcastEval((c) => c.guilds.cache.size),
    client.shard.broadcastEval((c) => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
    client.shard.broadcastEval((c) => c.manager.players.size),
    client.shard.broadcastEval((c) => {
      let i = 0;
      c.manager.players.forEach((e) => {
        i += e.playing ?? 0;
      });
      return i;
    }),
  ];

  await Promise.all(promises).then(async ([totalram, ramUsage, guilds, members, voiceConnections, playing]) => {
    const playingplayers = playing.reduce((acc, players) => acc + players, 0).toLocaleString();

    let field1 =
      `• Version   :: ${require("@root/package.json").version}\n` +
      `• Clusters   : ${client.shard.clusterId + 1} / ${client.shard.clusterCount}\n` +
      `  ↳ Shards   : ${message.guild.shardId + 1} / ${client.shard.shardCount}\n` +
      `  ↳ Servers  : ${guilds.reduce((acc, guildCount) => acc + guildCount, 0)}\n` +
      `  ↳ Users    : ${members.reduce((acc, memberCount) => acc + memberCount, 0)}\n` +
      `  ↳ Ping     : ${client.ws.ping}ms\n` +
      `  ↳ Players  : ${voiceConnections.reduce((acc, playerAmount) => acc + playerAmount, 0).toLocaleString()}\n` +
      `• Bot Uptime : ${client.utils.timeformat(process.uptime())}\n`;

    let feild2 = `• operating system :: ${osu.os.platform()}\n` + ` • CPU            :: ${Ncpu}\n`;
    await osu.cpu.usage().then((cpuPercentage) => {
      feild2 += `  ↳ CPU Usage     : ${cpuPercentage} %\n`;
    });
    let OSuptime = await osu.os.uptime();
    feild2 +=
      `  ↳ RAM Usage     : ${formatBytes(ramUsage)} / ${formatBytes(totalram)}\n` +
      `  ↳ System Uptime : ${client.utils.timeformat(OSuptime)}`;

    embed.addFields({
      name: `${client.emoji.bot} Bot Stats`,
      value: `\`\`\`yaml\n${field1}\n\`\`\``,
    });
    embed.addFields({
      name: `${client.emoji.bot} Bot Stats`,
      value: `\`\`\`yaml\n${feild2}\n\`\`\``,
    });

    const devs = ["663221211664482356", "188363246695219201"].find((x) => x === message.member.id);
    if (devs)
      embed.addFields([
        {
          name: "playing",
          value: `\`\`\`yaml\n${playingplayers}\`\`\``,
          inline: true,
        },
        {
          name: `ram`,
          value: `\`\`\`yaml\n${(((totalRam / 1024 / 1024) * 100) / 100).toFixed()}mb\`\`\``,
          inline: true,
        },
        {
          name: `avg cpu`,
          value: `\`\`\`yaml\n${avgCPU.toFixed(3)}%\`\`\``,
          inline: true,
        },
      ]);
  });

  return { embeds: [embed] };
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) {
    return "0 B";
  }

  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
