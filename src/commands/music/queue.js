const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const prettyms = require("pretty-ms");
const load = require("lodash");

module.exports = {
  name: "queue",
  description: "shows the player queue.",
  cooldown: 6,
  isPremium: false,
  category: "MUSIC",
  botPermissions: [],
  userPermissions: [],
  SameVoiceChannel: false,
  InVoiceChannel: false,
  InBotVC: true,
  Player: true,
  ActivePlayer: true,
  command: {
    enabled: true,
    aliases: ["q", "list"],
    usage: "",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [],
  },
  messageRun: async (client, message, args, player) => {
    if (player.queue.tracks.length === "0" || !player.queue.tracks.length) {
      const embed = new EmbedBuilder()
        .setColor(client.botcolor)
        .setDescription(
          `**Now playing**\n[${client.utils.trimTitle(player.queue.current.info.title)}](${
            player.queue.current.info.uri
          }) - \`${player.queue.current.isStream ? "◉ LIVE" : prettyms(player.queue.current.info.duration)}\` - ${
            player.queue.current.requester
          }\n\n No tracks in the queue`
        );
      const msg = await message.safeReply({
        embeds: [embed],
      });
    } else {
      const mapping = player.queue.tracks.map(
        (t, i) =>
          `\`${++i}.\` [${client.utils.trimTitle(t.info.title).substr(0, 50)}](${t.info.uri}) ${
            t.info.isStream ? "- `◉ LIVE`" : ""
          } - ${t.requester}\n`
      );

      const chunk = load.chunk(mapping, 10);
      const pages = chunk.map((s) => s.join(""));
      let page = args[0];
      if (!page) page = 0;
      if (page) page = page - 1;
      if (page > pages.length) page = 0;
      if (page < 0) page = 0;

      if (player.queue.tracks.length < 11) {
        const embed2 = new EmbedBuilder()
          .setColor(client.botcolor)
          .setDescription(
            `**Now playing**\n[${client.utils.trimTitle(player.queue.current.info.title)}](${
              player.queue.current.info.uri
            }) - \`${player.queue.current.isStream ? "◉ LIVE" : prettyms(player.queue.current.info.duration)}\` - ${
              player.queue.current.requester
            }\n\n **Queued Songs**\n${pages[page]}`
          )
          .setFooter({
            text: `Page ${page + 1}/${pages.length}`,
            iconURL: message.member.displayAvatarURL({ dynamic: true }),
          })

          .setAuthor({
            name: `Queue for ${message.guild.name} `,
            iconURL: message.guild.iconURL(),
            url: client.botinvite,
          });
        const msg = await message
          .safeReply({
            embeds: [embed2],
          })
          .catch(() => {});
      } else {
        const embed3 = new EmbedBuilder()
          .setColor(client.botcolor)
          .setDescription(
            `**Now playing**\n[${client.utils.trimTitle(player.queue.current.info.title)}](${
              player.queue.current.info.uri
            }) - \`${player.queue.current.isStream ? "◉ LIVE" : prettyms(player.queue.current.info.duration)}\` - ${
              player.queue.current.requester
            }\n\n **Queued Songs**\n${pages[page]}`
          )
          .setFooter({
            text: `Page ${page + 1}/${pages.length}`,
            iconURL: message.member.displayAvatarURL({ dynamic: true }),
          })

          .setAuthor({
            name: `Queue for ${message.guild.name} `,
            iconURL: message.guild.iconURL(),
            url: client.botinvite,
          });

        const but1 = new ButtonBuilder()
          .setCustomId("queue_cmd_but_1_app")
          .setEmoji("<:right:932917123158802472>")
          .setLabel("Forward")
          .setStyle(ButtonStyle.Secondary);

        const dedbut1 = new ButtonBuilder()
          .setDisabled(true)
          .setCustomId("queue_cmd_ded_but_1_app")
          .setEmoji("<:right:932917123158802472>")
          .setLabel("Forward")
          .setStyle(ButtonStyle.Secondary);

        const but2 = new ButtonBuilder()
          .setCustomId("queue_cmd_but_2_app")
          .setEmoji("<:left:932917123129442324>")
          .setLabel("Back")
          .setStyle(ButtonStyle.Secondary);

        const dedbut2 = new ButtonBuilder()
          .setDisabled(true)
          .setCustomId("queue_cmd_ded_but_2_app")
          .setEmoji("<:left:932917123129442324>")
          .setLabel("Back")
          .setStyle(ButtonStyle.Secondary);

        const but3 = new ButtonBuilder()
          .setCustomId("queue_cmd_but_3_app")
          .setEmoji("⏹️")
          .setStyle(ButtonStyle.Secondary);

        const dedbut3 = new ButtonBuilder()
          .setDisabled(true)
          .setCustomId("queue_cmd_ded_but_3_app")
          .setEmoji("⏹️")
          .setStyle(ButtonStyle.Secondary);

        const msg = await message
          .safeReply({
            embeds: [embed3],
            components: [new ActionRowBuilder().addComponents([but2, but3, but1])],
          })
          .catch(() => {});

        const collector = message.channel.createMessageComponentCollector({
          filter: (b) => {
            if (b.member.id === message.member.id) return true;
            else
              return b
                .reply({
                  content: `this buttons are only valid to use by the user who uses this command`,
                })
                .catch(() => {});
          },
          time: 60000 * 5,
          idle: 30e3,
        });

        collector.on("collect", async (button) => {
          if (button.customId === "queue_cmd_but_1_app") {
            await button.deferUpdate().catch(() => {});
            page = page + 1 >= pages.length ? 0 : ++page;
            const embed4 = new EmbedBuilder()
              .setColor(client.botcolor)
              .setDescription(`**Queued Songs**\n${pages[page]}`)
              .setFooter({
                text: `Page ${page + 1}/${pages.length}`,
                iconURL: message.member.displayAvatarURL({ dynamic: true }),
              })
              .setAuthor({
                name: `Queue for ${message.guild.name} `,
                iconURL: message.guild.iconURL(),
                url: client.botinvite,
              });

            await msg.edit({
              embeds: [embed4],
              components: [new ActionRowBuilder().addComponents([but2, but3, but1])],
            });
          } else if (button.customId === "queue_cmd_but_2_app") {
            await button.deferUpdate().catch(() => {});
            page = page > 0 ? --page : pages.length - 1;

            const embed5 = new EmbedBuilder()
              .setColor(client.botcolor)
              .setDescription(`**Queued Songs**\n${pages[page]}`)

              .setFooter({
                text: `Page ${page + 1}/${pages.length}`,
                iconURL: message.member.displayAvatarURL({ dynamic: true }),
              })

              .setAuthor({
                name: `Queue for ${message.guild.name} `,
                iconURL: message.guild.iconURL(),
                url: client.botinvite,
              });
            await msg
              .edit({
                embeds: [embed5],
                components: [new ActionRowBuilder().addComponents([but2, but3, but1])],
              })
              .catch(() => {});
          } else if (button.customId === "queue_cmd_but_3_app") {
            await button.deferUpdate().catch(() => {});
            await collector.stop();
          } else return;
        });

        collector.on("end", async () => {
          await msg.edit({
            // embeds: [embed3],
            components: [new ActionRowBuilder().addComponents([dedbut2, dedbut3, dedbut1])],
          });
        });
      }
    }
  },
  interactionRun: async (client, interaction, player) => {
    if (player.queue.tracks.length === "0" || !player.queue.tracks.length) {
      const embed = new EmbedBuilder()
        .setColor(client.botcolor)
        .setDescription(
          `**Now playing**\n[${client.utils.trimTitle(player.queue.current.info.title)}](${
            player.queue.current.info.uri
          }) - \`${player.queue.current.isStream ? "◉ LIVE" : prettyms(player.queue.current.info.duration)}\` - ${
            player.queue.current.requester
          }\n\n No tracks in the queue`
        );
      await interaction.followUp({
        embeds: [embed],
      });
    } else {
      const mapping = player.queue.tracks.map(
        (t, i) =>
          `\`${++i}.\` [${client.utils.trimTitle(t.info.title)}](${t.info.uri}) ${
            t.info.isStream ? "- `◉ LIVE`" : ""
          } - ${t.requester}\n`
      );

      const chunk = load.chunk(mapping, 10);
      const pages = chunk.map((s) => s.join(""));
      let page = interaction.options.getNumber("page");
      if (!page) page = 0;
      if (page) page = page - 1;
      if (page > pages.length) page = 0;
      if (page < 0) page = 0;

      if (player.queue.tracks.length < 11) {
        const embed2 = new EmbedBuilder()
          .setColor(client.botcolor)
          .setDescription(
            `**Now playing**\n[${client.utils.trimTitle(player.queue.current.info.title)}](${
              player.queue.current.info.uri
            }) - \`${player.queue.current.isStream ? "◉ LIVE" : prettyms(player.queue.current.info.duration)}\` - ${
              player.queue.current.requester
            }\n\n **Queued Songs**\n${pages[page]}`
          )
          .setFooter({
            text: `Page ${page + 1}/${pages.length}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })

          .setAuthor({
            name: `Queue for ${interaction.guild.name} `,
            iconURL: interaction.guild.iconURL(),
            url: client.botinvite,
          });
        await interaction
          .followUp({
            embeds: [embed2],
          })
          .catch(() => {});
      } else {
        const embed3 = new EmbedBuilder()
          .setColor(client.botcolor)
          .setDescription(
            `**Now playing**\n[${client.utils.trimTitle(player.queue.current.info.title)}](${
              player.queue.current.info.uri
            }) - \`${player.queue.current.isStream ? "◉ LIVE" : prettyms(player.queue.current.info.duration)}\` - ${
              player.queue.current.requester
            }\n\n **Queued Songs**\n${pages[page]}`
          )
          .setFooter({
            text: `Page ${page + 1}/${pages.length}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })

          .setAuthor({
            name: `Queue for ${interaction.guild.name} `,
            iconURL: interaction.guild.iconURL(),
            url: client.botinvite,
          });

        const but1 = new ButtonBuilder()
          .setCustomId("queue_cmd_but_1_app")
          .setEmoji("<:right:932917123158802472>")
          .setLabel("Forward")
          .setStyle(ButtonStyle.Secondary);

        const dedbut1 = new ButtonBuilder()
          .setDisabled(true)
          .setCustomId("queue_cmd_ded_but_1_app")
          .setEmoji("<:right:932917123158802472>")
          .setLabel("Forward")
          .setStyle(ButtonStyle.Secondary);

        const but2 = new ButtonBuilder()
          .setCustomId("queue_cmd_but_2_app")
          .setEmoji("<:left:932917123129442324>")
          .setLabel("Back")
          .setStyle(ButtonStyle.Secondary);

        const dedbut2 = new ButtonBuilder()
          .setDisabled(true)
          .setCustomId("queue_cmd_ded_but_2_app")
          .setEmoji("<:left:932917123129442324>")
          .setLabel("Back")
          .setStyle(ButtonStyle.Secondary);

        const but3 = new ButtonBuilder()
          .setCustomId("queue_cmd_but_3_app")
          .setEmoji("⏹️")
          .setStyle(ButtonStyle.Secondary);

        const dedbut3 = new ButtonBuilder()
          .setDisabled(true)
          .setCustomId("queue_cmd_ded_but_3_app")
          .setEmoji("⏹️")
          .setStyle(ButtonStyle.Secondary);

        await interaction
          .editReply({
            embeds: [embed3],
            components: [new ActionRowBuilder().addComponents([but2, but3, but1])],
          })
          .catch(() => {});

        const collector = interaction.channel.createMessageComponentCollector({
          filter: (b) => {
            if (b.member.id === interaction.member.id) return true;
          },
          time: 60000 * 5,
          idle: 30e3,
        });

        collector.on("collect", async (button) => {
          if (button.customId === "queue_cmd_but_1_app") {
            await button.deferUpdate().catch(() => {});
            page = page + 1 >= pages.length ? 0 : ++page;
            const embed4 = new EmbedBuilder()
              .setColor(client.botcolor)
              .setDescription(`**Queued Songs**\n${pages[page]}`)
              .setFooter({
                text: `Page ${page + 1}/${pages.length}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
              })
              .setAuthor({
                name: `Queue for ${interaction.guild.name} `,
                iconURL: interaction.guild.iconURL(),
                url: client.botinvite,
              });

            await interaction.editReply({
              embeds: [embed4],
              components: [new ActionRowBuilder().addComponents([but2, but3, but1])],
            });
          } else if (button.customId === "queue_cmd_but_2_app") {
            await button.deferUpdate().catch(() => {});
            page = page > 0 ? --page : pages.length - 1;

            const embed5 = new EmbedBuilder()
              .setColor(client.botcolor)
              .setDescription(`**Queued Songs**\n${pages[page]}`)

              .setFooter({
                text: `Page ${page + 1}/${pages.length}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
              })

              .setAuthor({
                name: `Queue for ${interaction.guild.name} `,
                iconURL: interaction.guild.iconURL(),
                url: client.botinvite,
              });
            await interaction
              .editReply({
                embeds: [embed5],
                components: [new ActionRowBuilder().addComponents([but2, but3, but1])],
              })
              .catch(() => {});
          } else if (button.customId === "queue_cmd_but_3_app") {
            await button.deferUpdate().catch(() => {});
            await collector.stop();
          } else return;
        });

        collector.on("end", async () => {
          await interaction.editReply({
            // embeds: [embed3],
            components: [new ActionRowBuilder().addComponents([dedbut2, dedbut3, dedbut1])],
          });
        });
      }
    }
  },
};
