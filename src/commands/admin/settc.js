const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const db = require("@models/settings");
module.exports = {
  name: "settc",
  description: "Add/Remove a Music Channel.",
  cooldown: 6,
  isPremium: false,
  category: "ADMIN",
  SameVoiceChannel: false,
  InVoiceChannel: false,
  InBotVC: false,
  Player: false,
  ActivePlayer: false,
  botPermissions: [],
  userPermissions: ["Administrator"],
  command: {
    enabled: true,
    aliases: [],
    usage: "",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "channel",
        description: "Add/Remove a Music Channel.'",
        type: ApplicationCommandOptionType.Channel,
        required: false,
      },
    ],
  },
  messageRun: async (client, message, args, player, data) => {
    let channel =
      message.mentions.channels.filter((ch) => ch.guild.id == message.guild.id).first() ||
      message.guild.channels.cache.find((c) => c.name == args[0]) ||
      message.guild.channels.cache.get(args[0]);

    if (args[0] && !channel) {
      const embed = new EmbedBuilder().setDescription(`Channel not found!`).setColor(client.config.COLORS.RedPink);
      return message.channel.safeSend({ embeds: [embed] });
    }
    const response = await settext(client, message, channel);
    await message.channel.safeSend(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    let channel = interaction.options.getChannel("channel");
    const response = await settext(client, interaction, channel);
    await interaction.followUp(response);
  },
};

async function settext(client, { guild }, channel) {
  const baseData = await db.findOne({ guild: guild.id });

  let leftb = "";
  if (baseData.botTC.length === 0) leftb = "There is no Music Channel set. ";
  else
    for (let i = 0; i < baseData.botTC.length; i++) {
      leftb += `**${i + 1}.** ` + "<#" + baseData.botTC[i] + ">" + ` (${baseData.botTC[i]})` + " \n";
    }

  if (!channel) {
    const embed = new EmbedBuilder()
      .setTitle("Configured Music Channels")
      .setDescription(`${leftb}`)
      .setColor(client.botcolor);
    return { embeds: [embed] };
  }

  if (!baseData) {
    baseData = new db({
      guild: guild.id,
      botTC: [channel.id],
    });
    await baseData.save();
    return {
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `Successfully Added <#${channel.id}> as music commands channel.\n\n\`note:\` to remove it, its the same command.`
          )
          .setColor(client.botcolor),
      ],
    };
  }
  let check = baseData.botTC.find((x) => x === channel.id);
  if (check) {
    baseData.botTC.pull(check);
    await baseData.save();
    return {
      embeds: [
        new EmbedBuilder().setDescription(`Removed <#${check}> from the Music Channel.`).setColor(client.botcolor),
      ],
    };
  }

  baseData.botTC.push(channel.id);
  await baseData.save();

  return {
    embeds: [
      new EmbedBuilder()
        .setDescription(
          `Successfully Added <#${channel.id}> as music commands channel.\n\n\`note:\` to remove it, its the same command.`
        )
        .setColor(client.botcolor),
    ],
  };
}
