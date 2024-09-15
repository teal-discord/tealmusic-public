const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const db = require("@models/settings");
module.exports = {
  name: "setdjcmd",
  description: "Add/Remove a DJ command.",
  cooldown: 7,
  isPremium: false,
  category: "ADMIN",
  botPermissions: [],
  userPermissions: ["Administrator"],
  command: {
    enabled: true,
    aliases: [],
    usage: "",
    example: "",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "command",
        description: "command to add/remove from dj",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },
  messageRun: async (client, message, args, player) => {
    const response = await setdjcmd(client, args[0], message.guild);
    await message.channel.safeSend(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    let djrole = interaction.options.getString("command");
    const response = await setdjcmd(client, djrole, interaction.guild);
    await interaction.followUp(response);
  },
};

async function setdjcmd(client, input, guild) {
  const baseData = await db.findOne({ guild: guild.id });
  let leftb = "";
  if (baseData.djCmd.length === 0) leftb = "There is no dj only command set";
  else
    for (let i = 0; i < baseData.djCmd.length; i++) {
      leftb += "`" + baseData.djCmd[i] + "`" + ", ";
    }

  if (!input) {
    const embed = new EmbedBuilder()
      .setTitle("Configured Dj commands")
      .setDescription(`${leftb}`)
      .setColor(client.botcolor);
    return { embeds: [embed] };
  }

  const cmd = client.getCommand(input.toLowerCase());

  if (!cmd) {
    return {
      embeds: [new EmbedBuilder().setDescription(`please provide a correct command name.`)],
    };
  }
  if (baseData) {
    let check = baseData.djCmd.find((x) => x === cmd.name);
    if (check) {
      baseData.djCmd.pull(check);
      await baseData.save();
      return {
        embeds: [
          new EmbedBuilder()
            .setDescription(`Successfully Removed \`${cmd.name}\` as a DJ command.`)
            .setColor(client.botcolor),
        ],
      };
    }
    baseData.djCmd.push(cmd.name);
    await baseData.save();
    const update = new EmbedBuilder()
      .setDescription(`Successfully Added ${cmd.name} as a DJ command.`)
      .setColor(client.botcolor);
    return { embeds: [update] };
  } else {
    const db = require("@models/settings");
    const baseData = new db({
      guild: guild.id,
      djCmd: [cmd.name],
    });
    await baseData.save();
    return {
      embeds: [
        new EmbedBuilder()
          .setDescription(`Successfully Added \`${cmd.name}\` as a DJ command.`)
          .setColor(client.botcolor),
      ],
    };
  }
}
