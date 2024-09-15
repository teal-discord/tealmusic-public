const { EmbedBuilder } = require("discord.js");
const prettyMs = require("pretty-ms");

module.exports = {
  name: "audionode",
  description: "shows audio node stats",
  cooldown: 5,
  isPremium: false,
  category: "OWNER",
  botPermissions: [],
  userPermissions: [],
  command: {
    enabled: true,
    aliases: ["node", "nodes"],
    usage: "",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: false,
    ephemeral: false,
    options: [],
  },
  messageRun: async (client, message, args, player, data) => {
    const response = await GetStats(client);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction) => {
    const response = await GetStats(client);
    await interaction.followUp(response);
  },
};

async function GetStats(client) {
  var all = await [...client.manager.nodeManager.nodes.values()]
    .map(
      (node) =>
        `Node          : ${node.options.id}` +
        `\nstatus        : ${node.connected ? "🟢 All good" : "Its Red 🔴"}` +
        `\nPlayers       : ${node.stats.playingPlayers} / ${node.stats.players}` +
        `\nUptime        : ${prettyMs(node.stats.uptime, {
          colonNotation: false,
        })}` +
        `\nRAM Usage     : ${(node.stats.memory.used / 1024 / 1024).toFixed(2)}MB / ${Math.round(
          node.stats.memory.reservable / 1024 / 1024
        ).toFixed(2)}MB` +
        `\nCpu Cores     : ${node.stats.cpu.cores}`
    )
    .join("\n------------------------------------------------\n\n");

  const embed = new EmbedBuilder()
    .setAuthor({ name: "Audio Nodes", iconURL: client.user.displayAvatarURL() })
    .setDescription(`\`\`\`ansi\n${all.cyan}\`\`\``)
    .setColor(client.config.COLORS.RoyalBlue);

  return { embeds: [embed] };
}
