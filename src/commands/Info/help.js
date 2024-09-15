const {
  ApplicationCommandOptionType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { getCommandUsage, getSlashUsage } = require("../../handlers/command");

module.exports = {
  name: "help",
  description: "Bot Manual",
  cooldown: 5,
  isPremium: false,
  category: "INFO",
  botPermissions: [],
  userPermissions: [],
  command: {
    enabled: true,
    aliases: ["hi", "h"],
    usage: "help <command>",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "command",
        description: "command name",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  messageRun: async (client, message, args, data) => {
    let trigger = args[0];
    if (!trigger) {
      const response = await HelpPage(client, message);
      return message.safeReply(response);
    } else {
      const command = client.getCommand(trigger);
      if (!command) return message.safeReply("no command found with that name :(");
      const response = await getCommandUsage(client, command, trigger);
      return await message.safeReply({ embeds: [response] });
    }
  },
  interactionRun: async (client, interaction, data) => {
    let trigger = interaction.options.getString("command");
    if (!trigger) {
      const response = await HelpPage(client, interaction);
      return await interaction.followUp(response);
    } else {
      const command = client.getCommand(trigger);
      if (!command) return interaction.followUp("no command found with that name :(");
      const response = await getSlashUsage(command, client);
      return await interaction.followUp({ embeds: [response] });
    }
  },
};

async function HelpPage(client, { member }) {
  const helpEmbed = new EmbedBuilder()
    .setColor(client.botcolor)
    .setAuthor({
      name: `${client.user.username} Help Panel`,
      iconURL: `${client.user.displayAvatarURL()}`,
      url: client.botinvite,
    })
    .setFooter({ text: `● Type '/help <CommandName>' for details on a command` });

  const commands = client.commands.filter((cmd) => cmd.category !== "OWNER");
  const appcmds = await client.application.commands.fetch();

  const content = `**👋 There's now a patreon page. [click here to view](https://www.patreon.com/join/lorenzo132)**\nPlease do not pledge to it if u cannot afford it <:_pepe_namaste:850283075353968650> Any support is ofcource appreciated.
 `;
  helpEmbed.setDescription(content);

  const Fields = [];
  ["MUSIC"].forEach((category) => {
    Fields.push({
      name: `${client.utils.capitalizeFirstLetter(category)} (${
        client.slashCommands.filter((cmd) => cmd.category === category).size
      } commands)`,
      value: commands
        .filter((cmd) => cmd.category === category)
        .map(
          (cmd) =>
            `${appcmds.filter((e) => e.name === cmd.name).map((c) => `</${c.name}:${c.id}>`) || `\`${cmd.name}\``}`
          // `\`/${cmd.name}\``
        )
        .join("**, **"),
      inline: false,
    });
  });
  Fields.push({
    name: "Teal Playlists (9 commands)",
    value: `${appcmds
      .filter((e) => e.name === "playlist")
      .first()
      .options.map(
        (c) =>
          `${
            appcmds.filter((e) => e.name === "playlist").map((w) => `</playlist ${c.name}:${w.id}>`) ||
            `\`${cmd.name}\``
          }`
      )
      .join("**, **")}`,
    inline: false,
  });
  Fields.push({
    name: "Filters  (18 commands)",
    value: `${appcmds
      .filter((e) => e.name === "filter")
      .first()
      .options.map(
        (c) =>
          `${appcmds.filter((e) => e.name === "filter").map((w) => `</filter ${c.name}:${w.id}>`) || `\`${cmd.name}\``}`
      )
      .join("**, **")}`,
    inline: true,
  });
  ["INFO", "ADMIN", "PREMIUM"].forEach((category) => {
    Fields.push({
      name:
        category === "PREMIUM"
          ? `${client.emoji.premium} ${client.utils.capitalizeFirstLetter(category)}`
          : `${client.utils.capitalizeFirstLetter(category)} (${
              client.slashCommands.filter((cmd) => cmd.category === category).size
            } commands) `,
      value: commands
        .filter((cmd) => cmd.category === category)
        .map(
          (cmd) =>
            `${appcmds.filter((e) => e.name === cmd.name).map((c) => `</${c.name}:${c.id}>`) || `\`${cmd.name}\``}`
          //`\`/${cmd.name}\``
        )
        .join("**, **"),
      inline: false,
    });
  });

  Fields.forEach((field) => helpEmbed.addFields(field));
  helpEmbed.addFields({
    name: `Links: `,
    value: `**[Invite Me](${client.botinvite}) • [Premium](${client.config.PATREON}) • [Support Server](${client.config.SUPPORT_SERVER}) • [Vote](${client.config.VOTE})**`,
    inline: false,
  });

  const row = new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("Invite")
      .setEmoji(client.emoji.invite)
      .setURL(client.botinvite),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("Support")
      .setEmoji(client.emoji.support)
      .setURL(client.config.SUPPORT_SERVER),
    new ButtonBuilder()
      .setLabel("Premium")
      .setEmoji(client.emoji.premium)
      .setURL(client.config.PATREON)
      .setStyle(ButtonStyle.Link),
  ]);

  return { embeds: [helpEmbed], components: [row] };
}
