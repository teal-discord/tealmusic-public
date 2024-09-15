const {
  ApplicationCommandOptionType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
  ComponentType,
} = require("discord.js");
const { inspect } = require("util");
/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "eval",
  description: "evaluates something",
  category: "OWNER",
  botPermissions: [],
  command: {
    enabled: true,
    usage: "<code>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: false,
    options: [
      {
        name: "expression",
        description: "content to evaluate",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
  messageRun: async (client, message, args, player, data) => {
    if (!client.config.OWNER_IDS.includes(message.author.id)) return;

    const code = args.join(" ");
    if (!code) return;
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("delete-evaluated-output")
        .setEmoji("957597580806717470")
        .setLabel("Delete")
        .setStyle(ButtonStyle.Danger)
    );
    const msg = await message.reply({
      components: [row],
      content: `<:reply1:1092924578780680322> <a:loading:982616541776465921> Operation taking a while.`,
    });

    try {
      let end;
      let start;

      start = new Date();

      let output = eval(code);
      // if (output instanceof Promise ||(Boolean(output) && typeof output.then === "function" && typeof output.catch === "function"));

      output = await output;
      output = inspect(output, { depth: 1 }).replaceAll(client.token, "[access token]");

      for (let i = 0; i < 1000; i++) {
        Math.sqrt(i);
      }
      end = new Date();

      if (output.length < 1800) {
        msg.edit({
          components: [row],
          content: `\`\`\`js\n${output.replaceAll("'", "")}\`\`\`<:reply1:1092924578780680322> ⏰ Operation took ${
            end?.getTime() - start?.getTime()
          }ms${end?.getTime() - start?.getTime() > 1 ? "s" : ""}.`,
        });
      } else {
        const result = new AttachmentBuilder(Buffer.from(output), {
          name: "output.js",
        });
        msg.edit({
          components: [row],
          content: `<:reply1:1092924578780680322> ⏰ Operation took ${end?.getTime() - start?.getTime()}ms${
            end?.getTime() - start?.getTime() > 1 ? "s" : ""
          }.`,
          files: [result],
        });
      }

      const filter = (i) => {
        if (client.config.OWNER_IDS.includes(i.user.id)) return true;
        i.deferUpdate();
        return false;
      };

      const collector = await message.channel.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
      });

      collector.on("collect", async (i) => {
        if (i.customId === "delete-evaluated-output") {
          try {
            i.message.delete().catch(() => {});
          } catch {
            (e) => {};
          }
        }
      });
    } catch (error) {
      msg.edit({ content: ` \`\`\`js\n${error}\`\`\` ` });
    }
  },
};
