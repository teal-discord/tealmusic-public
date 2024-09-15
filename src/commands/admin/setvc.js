const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const db = require("@models/settings");
module.exports = {
  name: "setvc",
  description: "Add/Remove a Music voice Channel.",
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
        description: "Add/Remove a Music voice Channel.'",
        type: ApplicationCommandOptionType.Channel,
        required: false,
      },
    ],
  },
  messageRun: async (client, message, args, player) => {
    let channel =
      message.mentions.channels.filter((ch) => ch.guild.id == message.guild.id).first() ||
      message.guild.channels.cache.find((c) => c.name == args[0]) ||
      message.guild.channels.cache.get(args[0]);
    if (args[0] && !channel) {
      const embed = new EmbedBuilder().setDescription(`Channel not found!`).setColor(client.config.COLORS.RedPink);
      return await message.channel.safeSend({ embeds: [embed] });
    }
    const response = await setvoice(client, message, channel);
    message.safeReply(response);
  },
  interactionRun: async (client, interaction, player) => {
    let channel = interaction.options.getChannel("channel");
    const response = await setvoice(client, interaction, channel);
    await interaction.followUp(response);
  },
};

async function setvoice(client, { guild }, channel) {
  const baseData = await db.findOne({ guild: guild.id });

  let leftb = "";
  if (baseData.botVC.length === 0) leftb = "There is no Music Channel set. ";
  else
    for (let i = 0; i < baseData.botVC.length; i++) {
      leftb += `**${i + 1}.** ` + "<#" + baseData.botVC[i] + ">" + ` (${baseData.botVC[i]})` + " \n";
    }

  if (!channel) {
    const embed = new EmbedBuilder()
      .setTitle("Configured Music voice Channels")
      .setDescription(`${leftb}`)
      .setColor(client.botcolor);
    return { embeds: [embed] };
  }

  if (channel.type !== 2) {
    const embed = new EmbedBuilder().setDescription(`Voice channel not found!`).setColor(client.botcolor);
    return { embeds: [embed] };
  }

  if (!baseData) {
    baseData = new db({
      guild: guild.id,
      botVC: [channel.id],
    });
    await baseData.save();
    return {
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `Successfully Added <#${channel.id}> as music voice channel.\n\n\`note:\` to remove it, its the same command.`
          )
          .setColor(client.botcolor),
      ],
    };
  }
  let check = baseData.botVC.find((x) => x === channel.id);
  if (check) {
    baseData.botVC.pull(check);
    await baseData.save();
    return {
      embeds: [
        new EmbedBuilder()
          .setDescription(`Removed <#${check}> from the Music voice Channel.`)
          .setColor(client.botcolor),
      ],
    };
  }

  baseData.botVC.push(channel.id);
  await baseData.save();

  return {
    embeds: [
      new EmbedBuilder()
        .setDescription(
          `Successfully Added <#${channel.id}> as music voice channel.\n\n\`note:\` to remove it, its the same command.`
        )
        .setColor(client.botcolor),
    ],
  };
}
