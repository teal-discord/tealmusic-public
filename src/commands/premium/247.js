const { EmbedBuilder } = require("discord.js");
//const db = require("@models/247");

module.exports = {
  name: "247",
  description: "never leaves the voice channel.",
  cooldown: 6,
  isPremium: true,
  category: "PREMIUM",
  botPermissions: [],
  userPermissions: ["ManageMessages"],
  SameVoiceChannel: true,
  InVoiceChannel: true,
  InBotVC: true,
  Player: true,
  ActivePlayer: false,
  command: {
    enabled: true,
    aliases: ["autojoin", "24/7"],
    usage: "247",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
  },

  messageRun: async (client, message, args, player) => {
    const response = await twentyfourseven(client, player);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player) => {
    const response = await twentyfourseven(client, player);
    await interaction.followUp(response);
  },
};

async function twentyfourseven(client, player) {
  let data = await client.twofoursevenModel.findOne({ guild: player.guildId });

  if (data) {
    await data.deleteOne();
    let thing = new EmbedBuilder().setColor(client.botcolor).setDescription(`247 Mode is now **Disabled**!`);
    return { embeds: [thing] };
  } else {
    const data = new client.twofoursevenModel({
      guild: player.guildId,
      autojoin: true,
      autojoinTC: player.textChannelId,
      autojoinVC: player.voiceChannelId,
    });
    await data.save();
    let thing = new EmbedBuilder().setColor(client.botcolor).setDescription(`247 Mode is now **Enabled**!`);
    return { embeds: [thing] };
  }
}
