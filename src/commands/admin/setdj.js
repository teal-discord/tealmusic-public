const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const db = require("@models/settings");
module.exports = {
  name: "setdj",
  description: "Add/Remove a DJ role.",
  cooldown: 6,
  isPremium: false,
  category: "ADMIN",
  botPermissions: [],
  userPermissions: ["Administrator"],
  command: {
    enabled: true,
    aliases: ["djrole", "djroles"],
    usage: "@DJ",
    example: "",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "role",
        description: "role to add/remove from dj'",
        type: ApplicationCommandOptionType.Role,
        required: false,
      },
    ],
  },
  messageRun: async (client, message, args, player) => {
    let djrole =
      message.mentions.roles.first() ||
      message.guild.roles.cache.find((r) => r.name.toLowerCase() == args.join(" ")) ||
      message.guild.roles.cache.get(args.join(" "));

    if (args[0] && !djrole) {
      const embed = new EmbedBuilder().setDescription(`Role not found!`).setColor(client.botcolor);
      return message.channel.safeSend({ embeds: [embed] });
    }

    const response = await Setdj(client, message, djrole);
    await message.channel.safeSend(response);
  },
  interactionRun: async (client, interaction, player) => {
    let djrole = interaction.options.getRole("role");
    const response = await Setdj(client, interaction, djrole);
    await interaction.followUp(response);
  },
};

async function Setdj(client, { member, guild, channel }, djrole) {
  const baseData = await db.findOne({ guild: guild.id });

  let leftb = "";
  if (baseData.djRoles.length === 0) leftb = "There is no DJ role set. ";
  else
    for (let i = 0; i < baseData.djRoles.length; i++) {
      leftb += "<@&" + baseData.djRoles[i] + ">\n";
    }

  if (!djrole) {
    const embed = new EmbedBuilder()
      .setTitle("Configured DJ roles")
      .setDescription(`${leftb}`)
      .setColor(client.botcolor);
    return { embeds: [embed] };
  }

  if (!baseData) {
    baseData = new db({
      guild: guild.id,
      djRoles: [djrole.id],
    });
    await baseData.save();
    return {
      embeds: [
        new EmbedBuilder().setDescription(`Added <@&${djrole.id}> to the DJ roles List.`).setColor(client.botcolor),
      ],
    };
  } else {
    let rolecheck = baseData.djRoles.find((x) => x === djrole.id);

    if (rolecheck) {
      baseData.djRoles.pull(rolecheck);
      return {
        embeds: [
          new EmbedBuilder().setDescription(`Removed <@&${djrole.id}> from the DJ roles.`).setColor(client.botcolor),
        ],
      };
    }

    baseData.djRoles.push(djrole.id);
    await baseData.save();

    return {
      embeds: [new EmbedBuilder().setDescription(`Added <@&${djrole.id}> to the DJ roles.`).setColor(client.botcolor)],
    };
  }
}
