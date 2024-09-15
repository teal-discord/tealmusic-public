const { commandHandler } = require("../../../handlers/index");
const { ButtonStyle, ButtonBuilder, ActionRowBuilder } = require("discord.js");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Message} message
 **/

module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;

  let prefix = client.config.DEFAULT_PREFIX;
  let baseData = await client.getGuildData(message.guild);
  if (baseData && baseData.prefix) prefix = baseData.prefix;
  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
  if (!prefixRegex.test(message.content)) return;
  const [matchedPrefix] = message.content.match(prefixRegex);
  const [cmdName] = message.content.slice(matchedPrefix.length).trim().split(/ +/g);

  const mention = new RegExp(`^<@!?${client.user.id}>( |)$`);
  if (message.content.match(mention)) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(`Bot Support`)
        .setEmoji(client.emoji.support)
        .setURL(client.config.SUPPORT_SERVER)
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel(`Bot Invite`)
        .setEmoji(client.emoji.invite)
        .setURL(client.botinvite)
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel(`Bot Premium`)
        .setEmoji(client.emoji.premium)
        .setURL(client.config.PATREON)
        .setStyle(ButtonStyle.Link)
    );
    const content = `**Settings for this server**\nprefix for this server is \`/\`, <@${client.user.id}>\n\ntype </help:983623228117368877> or \`@${client.user.username} help\` for the list of commands.`;
    message.safeReply({ content: content, components: [row] });
  }

  const cmd = client.getCommand(cmdName);
  if (cmd) {
    commandHandler.handlePrefixCommand(client, message, cmd, baseData);
  }
};

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
}
