const { EmbedBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { OWNER_IDS, DEFAULT_PREFIX, COLORS } = require("../config");
const permissions = require("../helpers/permissions");
const premiuemDB = require("@models/premium");
const UsersDB = require("@models/premium-users");
const prettyms = require("pretty-ms");
module.exports = {
  /**
   * @param {import('discord.js').Client} client
   * @param {import('discord.js').Message} message
   * @param {import("@structures/Command")} cmd
   * @param {object} settings
   */
  handlePrefixCommand: async function (client, message, cmd, settings) {
    const prefix = settings.prefix;
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(message.content)) return;
    const [, matchedPrefix] = message.content.match(prefixRegex);
    const [...args] = message.content.slice(matchedPrefix.length).trim().split(/ +/g);
    const invoke = args.shift().toLowerCase();
    const player = client.manager.players.get(message.guildId);

    const baseData = {};
    baseData.settings = settings;
    baseData.prefix = prefix;
    baseData.invoke = invoke;

    if (!message.channel.permissionsFor(message.guild.members.me).has("SendMessages")) return;

    // Owner commands
    if (cmd.category === "OWNER") {
      const checkRole = message.member.roles.cache.get("864535010928492544");
      if (!OWNER_IDS.includes(message.author.id) && !checkRole) return;
    }

    // check user permissions
    if (cmd.userPermissions && cmd.userPermissions?.length > 0) {
      if (!message.channel.permissionsFor(message.member).has(cmd.userPermissions)) {
        return message.safeReply(
          `You lack Permissions ${client.utils.parsePermissions(
            cmd.userPermissions
          )} to use this command on this server.`
        );
      }
    }

    if (!message.channel.permissionsFor(message.guild.members.me).has(`SendMessages`)) {
      return;
    }
    if (!message.channel.permissionsFor(message.guild.members.me).has(`ReadMessageHistory`)) {
      return message.safeReply(
        `I require the permission: \`Read Message History\` in this channel to reply to your commands.\n\nMake sure to check all the other roles I have for that permission and remember to check in channel-specific permissions.`
      );
    }
    if (!message.channel.permissionsFor(message.guild.members.me).has(`EmbedLinks`)) {
      return message.safeReply(
        `I require the permission: \`Embed Links\` in this channel.\n\nMake sure to check all the other roles I have for that permission and remember to check in channel-specific permissions.`
      );
    }

    // check bot permissions
    if (cmd.botPermissions && cmd.botPermissions.length > 0) {
      if (!message.channel.permissionsFor(message.guild.members.me).has(cmd.botPermissions)) {
        return message.safeReply(`I need ${client.utils.parsePermissions(cmd.botPermissions)} for this command`);
      }
    }

    if (baseData.settings) {
      if (baseData.settings.botTC.toString() !== "") {
        if (!baseData.settings.botTC.includes(message.channelId) && !message.member.permissions.has(`Administrator`)) {
          let leftb = "";
          for (let i = 0; i < baseData.settings.botTC.length; i++) {
            leftb += "<#" + baseData.settings.botTC[i] + "> , ";
          }
          not_allowed = true;
          const idk = new EmbedBuilder()
            .setColor(client.botcolor)
            .setDescription(
              `${client.emoji.Error} you are only allowed to use music commands in these channels: \n>>> ${leftb.substr(
                0,
                leftb.length - 3
              )}`
            );
          const x = await message.safeReply({ embeds: [idk] });
          setTimeout(() => x.delete().catch((e) => x.delete().catch((e) => x.delete().catch((e) => {}))), 8000);
          return;
        }
      }

      if (baseData.settings.djCmd.length > 0 && baseData.settings.djCmd.find((x) => x === cmd.name)) {
        //Check if there is a Dj Setup
        if (baseData.settings.djRoles.length !== 0) {
          //create the string of all djs and if he is a dj then set it to true
          let isdj = false;

          for (let l = 0; l < baseData.settings.djRoles.length; l++) {
            if (message.member.roles.cache.has(baseData.settings.djRoles[l])) isdj = true;
            if (!message.guild.roles.cache.get(baseData.settings.djRoles[l])) continue;
          }

          if (
            !isdj &&
            player?.queue?.current?.requester?.id !== message.member.id &&
            !message.member.permissions.has("ManageMessages")
          ) {
            const yiyi = new EmbedBuilder()
              .setColor(client.botcolor)
              .setDescription(`You need DJ role (or) \`Manage Messages\` permissions to use this command.`);
            return message.safeReply({ embeds: [yiyi], ephemeral: false });
          }
        }
      }
    }

    const embed = new EmbedBuilder().setColor(client.botcolor);

    if (cmd.Player && !player) {
      embed.setDescription(
        "**There is no Active Player created in this guild.**\n\nmake me join your voice with using `/join`"
      );
      return message.safeReply({ embeds: [embed] });
    }
    if (cmd.InVoiceChannel && !message.member.voice.channel) {
      return await message
        .safeReply({
          embeds: [
            embed.setDescription(
              `**You aren't connected to the same voice channel as I am**.\n channel: <#${message.guild.members.me.voice.channelId}>`
            ),
          ],
        })
        .catch(() => {});
    }
    if (cmd.SameVoiceChannel) {
      if (message.guild.members.me.voice.channel) {
        if (message.guild.members.me.voice.channelId !== message.member.voice.channelId) {
          return await message
            .safeReply({
              embeds: [
                embed.setDescription(
                  `**You aren't connected to the same voice channel as I am**.\n channel: <#${message.guild.members.me.voice.channelId}>`
                ),
              ],
            })
            .catch(() => {});
        }
      }
    }
    if (cmd.InBotVC) {
      if (baseData.settings.botVC.toString() !== "") {
        if (
          !baseData.settings.botVC.includes(message.member.voice.channelId) &&
          !message.member.permissions.has(`ManageMessages`) &&
          !player
        ) {
          let leftb = "";
          for (let i = 0; i < baseData.settings.botVC.length; i++) {
            leftb += "<#" + baseData.settings.botVC[i] + "> , ";
          }
          not_allowed = true;
          const idk = new EmbedBuilder()
            .setColor(client.botcolor)
            .setDescription(
              `I am restricted to only join one of the following voice channels: \n>>> ${leftb.substr(
                0,
                leftb.length - 3
              )}`
            );
          return message.safeReply({ embeds: [idk] });
        }
      }
    }
    if (cmd.ActivePlayer) {
      if (!player.queue.current) {
        embed.setDescription(
          `**I am actively not playing anything on this server.**\n\nFirst play something with /play to use this command.`
        );
        return message.safeReply({ embeds: [embed] });
      }
    }
    if (cmd.isPremium || cmd.category === "PREMIUM") {
      let hasVoted;
      let user;
      let guild = await premiuemDB.findOne({ guildId: message.guild.id, isPremium: true });
      if (!guild) user = client.premiumUsers.includes(message.member.id);
      if (!guild && !user) hasVoted = await client.topgg.hasVoted(message.member.id);
      if (!hasVoted && !guild && !user) {
        const embd = new EmbedBuilder()
          .setColor(client.botcolor)
          .setDescription(
            "**[Click here](https://top.gg/bot/972795104525975622/vote) to vote and use this command for the next 12 hours.**\n\n" +
              "By Buying our [Patreon](https://www.patreon.com/join/lorenzo132) you can bypass this requirement for all members in this server."
          )
          .setAuthor({
            name: "This command requires premium (or) you need to vote.",
            iconURL: client.user.displayAvatarURL(),
          });
        const link = new ButtonBuilder()
          .setLabel(`Vote Me Link`)
          .setStyle(ButtonStyle.Link)
          .setEmoji("<:upvote:778416296630157333>")
          .setURL(client.config.VOTE);
        const patreon = new ButtonBuilder()
          .setLabel(`Patreon Page`)
          .setStyle(ButtonStyle.Link)
          .setEmoji("<:patreon:1128604712623677453>")
          .setURL(client.config.PATREON);
        const row = new ActionRowBuilder().addComponents(link, patreon);
        return message.safeReply({ embeds: [embd], components: [row] });
      }
    }

    // minArgs count
    if (cmd.command.minArgsCount > args.length && cmd.category !== "OWNER") {
      const usageEmbed = this.getCommandUsage(client, cmd, invoke);
      return message.safeReply({ embeds: [usageEmbed] });
    }

    // cooldown check

    if (cmd.cooldown > 0) {
      const remaining = getRemainingCooldown(message.author.id, cmd, client);
      if (remaining && cmd.cooldown < 3) {
        return;
      }
      if (remaining && cmd.cooldown < 6) {
        return message.safeReply(`### A little too quick there.`, 4);
      }
      if (remaining && cmd.cooldown > 6) {
        return message.safeReply(
          `### A little too quick there. You can again use the command in \`${client.utils.timeformat(remaining)}\``,
          5
        );
      }
    }

    try {
      message.channel.sendTyping();
      cmd.messageRun(client, message, args, player, baseData);
    } catch (ex) {
      client.logger.error("messageRun", ex);
    } finally {
      if (cmd.cooldown > 0) applyCooldown(message.author.id, cmd, client);
    }
  },

  /**
   * @param {import('discord.js').Client} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  handleSlashCommand: async function (client, interaction) {
    const cmd = client.slashCommands.get(interaction.commandName);
    if (!cmd)
      return interaction
        .reply({
          content: "this command is outdated, wait for Discord to refresh my commands on this server!",
          ephemeral: true,
        })
        .catch(() => {});

    const baseData = {};
    baseData.settings = await client.getGuildData(interaction.guild);
    baseData.prefix = `/`;
    baseData.invoke = cmd.name;

    const player = client.manager.players.get(interaction.guild.id);

    // user permissions
    if (interaction.member && cmd.userPermissions?.length > 0) {
      if (!interaction.member.permissions.has(cmd.userPermissions)) {
        return interaction.reply({
          content: `You lack Permissions ${client.utils.parsePermissions(
            cmd.userPermissions
          )} to use this command on this server.`,
          ephemeral: true,
        });
      }
    }

    // bot permissions
    if (cmd.botPermissions && cmd.botPermissions.length > 0) {
      if (!interaction.guild.members.me.permissions.has(cmd.botPermissions)) {
        return interaction.reply({
          content: `I need Permissions ${client.utils.parsePermissions(cmd.botPermissions)} here to use this command.`,
          ephemeral: true,
        });
      }
    }

    if (baseData.settings) {
      if (baseData.settings.botTC.toString() !== "") {
        if (
          !baseData.settings.botTC.includes(interaction.channelId) &&
          !interaction.member.permissions.has(`Administrator`)
        ) {
          let leftb = "";
          for (let i = 0; i < baseData.settings.botTC.length; i++) {
            leftb += "<#" + baseData.settings.botTC[i] + "> , ";
          }
          not_allowed = true;
          const idk = new EmbedBuilder()
            .setColor(client.botcolor)
            .setDescription(
              `${client.emoji.Error} you are only allowed to use music commands in these channels: \n>>> ${leftb.substr(
                0,
                leftb.length - 3
              )}`
            );
          return interaction.reply({ embeds: [idk], ephemeral: true });
        }
      }

      if (baseData.settings.djCmd.length > 0 && baseData.settings.djCmd.find((x) => x === cmd.name)) {
        //Check if there is a Dj Setup
        if (baseData.settings.djRoles.length !== 0) {
          //create the string of all djs and if he is a dj then set it to true
          let isdj = false;

          for (let l = 0; l < baseData.settings.djRoles.length; l++) {
            if (interaction.member.roles.cache.has(baseData.settings.djRoles[l])) isdj = true;
            if (!interaction.member.roles.cache.get(baseData.settings.djRoles[l])) continue;
          }

          if (
            !isdj &&
            player?.queue?.current?.requester?.id !== interaction.member.id &&
            !interaction.member.permissions.has("ManageMessages")
          ) {
            const yiyi = new EmbedBuilder()
              .setColor(client.botcolor)
              .setDescription(`You need DJ role (or) \`Manage Messages\` permissions to use this command.`);
            return interaction.reply({ embeds: [yiyi], ephemeral: true });
          }
        }
      }
    }

    const embed = new EmbedBuilder().setColor(client.botcolor);

    if (cmd.Player && !player) {
      embed.setDescription(
        "**There is no Active Player created in this guild.**\n\nmake me join your voice with using `/join`"
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    if (cmd.InVoiceChannel && !interaction.member.voice.channel) {
      return await interaction
        .reply({
          embeds: [
            embed.setDescription(
              `**You aren't connected to the same voice channel as I am**.\n channel: <#${interaction.guild.members.me.voice.channelId}>`
            ),
          ],
          ephemeral: true,
        })
        .catch(() => {});
    }
    if (cmd.SameVoiceChannel) {
      if (interaction.guild.members.me.voice.channel) {
        if (interaction.guild.members.me.voice.channelId !== interaction.member.voice.channelId) {
          return await interaction
            .reply({
              embeds: [
                embed.setDescription(
                  `**You aren't connected to the same voice channel as I am**.\n channel: <#${interaction.guild.members.me.voice.channelId}>`
                ),
              ],
              ephemeral: true,
            })
            .catch(() => {});
        }
      }
    }
    if (cmd.InBotVC) {
      if (baseData.settings.botVC.toString() !== "") {
        if (
          !baseData.settings.botVC.includes(interaction.member.voice.channelId) &&
          !interaction.member.permissions.has(`ManageMessages`) &&
          !player
        ) {
          let leftb = "";
          for (let i = 0; i < baseData.settings.botVC.length; i++) {
            leftb += "<#" + baseData.settings.botVC[i] + "> , ";
          }
          not_allowed = true;
          const idk = new EmbedBuilder()
            .setColor(client.botcolor)
            .setDescription(
              `I am restricted to only join one of the following voice channels: \n>>> ${leftb.substr(
                0,
                leftb.length - 3
              )}`
            );
          return await interaction.reply({ embeds: [idk], ephemeral: true });
        }
      }
    }
    if (cmd.ActivePlayer) {
      if (!player.queue.current) {
        embed.setDescription(
          `**I am actively not playing anything on this server.**\n\nFirst play something with /play to use this command.`
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
    if (cmd.isPremium) {
      let hasVoted;
      let user;
      let guild = await premiuemDB.findOne({ guildId: interaction.guild.id });
      if (!guild) user = client.premiumUsers.includes(interaction.member.id);
      if (!guild && !user) hasVoted = await client.topgg.hasVoted(interaction.member.id);
      if (!hasVoted && !guild && !user) {
        const embd = new EmbedBuilder()
          .setColor(client.botcolor)
          .setDescription(
            "**[Click here](https://top.gg/bot/972795104525975622/vote) to vote and use this command for the next 12 hours.**\n\n" +
              "By Buying our [Patreon](https://www.patreon.com/join/lorenzo132) you can bypass this requirement for all members in this server."
          )
          .setAuthor({
            name: "This command requires premium (or) you need to vote.",
            iconURL: client.user.displayAvatarURL(),
          });
        const link = new ButtonBuilder()
          .setLabel(`Vote Me Link`)
          .setStyle(ButtonStyle.Link)
          .setEmoji("<:upvote:778416296630157333>")
          .setURL(client.config.VOTE);
        const patreon = new ButtonBuilder()
          .setLabel(`Patreon Page`)
          .setStyle(ButtonStyle.Link)
          .setEmoji("<:patreon:1128604712623677453>")
          .setURL(client.config.PATREON);
        const row = new ActionRowBuilder().addComponents(link, patreon);
        return await interaction.reply({
          embeds: [embd],
          components: [row],
          ephemeral: true,
        });
      }
    }

    // cooldown check
    if (cmd.cooldown > 0) {
      const remaining = getRemainingCooldown(interaction.user.id, cmd, client);
      if (remaining > 0) {
        return interaction.reply({
          content: `## A little too quick there. You can again use the command in \`${client.utils.timeformat(
            remaining
          )}\``,
          ephemeral: true,
        });
      }
    }

    try {
      await interaction.deferReply({ ephemeral: cmd.slashCommand.ephemeral });
      await cmd.interactionRun(client, interaction, player, baseData);
    } catch (ex) {
      await interaction
        .editReply({
          content: `something went wrong while using this command :( please try again later\n[need help? find help for teal here](${client.config.SUPPORT_SERVER})`,
          ephemeral: true,
        })
        .catch((e) => {});

      client.logger.error("interactionRun", ex);
      /*
      const embed = new EmbedBuilder()
        .setTimestamp()
        .setFooter({ text: "Error Reported At" })
        .setTitle("SlashCommand Error")
        .addFields(
          { name: "Command", value: `\`\`\`${interaction.commandName}\`\`\`` },
          {
            name: "Triggered By",
            value: `\`\`\`${interaction.member.user.tag}\`\`\``,
          },
          {
            name: "Error Stack",
            value: `\`\`\`${ex.stack.slice(0, 950)}\`\`\``,
          },
          {
            name: "Error Message",
            value: `\`\`\`${ex.message.slice(0, 950)}\`\`\``,
          }
        );
      client.errorHook.send({
        username: `${client.user.username} errors`,
        avatarURL: `${client.user.displayAvatarURL()}`,
        embeds: [embed],
      });
      */
    } finally {
      if (cmd.cooldown > 0) applyCooldown(interaction.user.id, cmd, client);
    }
  },

  /**
   * Build a usage embed for this command
   * @param {import('discord.js').Client} client - discord client
   * @param {import('@structures/Command')} cmd - command object
   * @param {string} prefix - guild bot prefix
   * @param {string} invoke - alias that was used to trigger this command
   * @param {string} [title] - the embed title
   */
  getCommandUsage(client, cmd, invoke, title = "Usage") {
    let desc = "";

    desc += `\`\`\`css\n@tealmusic ${invoke || cmd.name} ${cmd.command.usage}\`\`\``;
    if (cmd.command.example)
      desc += `**Example:**\n\`\`\`ansi\n${`@tealmusic`.cyan} ${`${invoke || cmd.name}`.america} ${
        `${cmd.command.example}`.blue
      }\n\`\`\``;
    if (cmd.description !== "") desc += `\n**Help:** ${cmd.description}`;
    if (cmd.cooldown) desc += `\n**Cooldown:** ${client.utils.timeformat(cmd.cooldown)}`;

    const embed = new EmbedBuilder().setColor(COLORS.BLUE).setDescription(desc);
    if (title) embed.setAuthor({ name: title });
    return embed;
  },

  /**
   * @param {import('@structures/Command')} cmd - command object
   */
  getSlashUsage(cmd, client) {
    let desc = "";
    desc += `\`/${cmd.name}\`\n\n**Help:** ${cmd.description}`;
    if (cmd.cooldown) {
      desc += `\n**Cooldown:** ${client.utils.timeformat(cmd.cooldown)}`;
    }

    return new EmbedBuilder().setColor(client.botcolor).setDescription(desc);
  },
};

/**
 * @param {string} memberId
 * @param {object} cmd
 * @param {import('discord.js').Client} client
 */
function applyCooldown(memberId, cmd, client) {
  const key = cmd.name + "|" + memberId;
  client.cooldownCache.set(key, Date.now());
}

/**
 * @param {string} memberId
 * @param {object} cmd
 * @param {import('discord.js').Client} client
 */
function getRemainingCooldown(memberId, cmd, client) {
  const key = cmd.name + "|" + memberId;
  if (client.cooldownCache.has(key)) {
    const remaining = (Date.now() - client.cooldownCache.get(key)) * 0.001;
    if (remaining > cmd.cooldown) {
      client.cooldownCache.delete(key);
      return 0;
    }
    return cmd.cooldown - remaining;
  }
  return 0;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
}
