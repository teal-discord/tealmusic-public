const { EmbedBuilder } = require("discord.js");
module.exports = {
  name: "resume",
  description: "resume the current paused track.",
  cooldown: 6,
  isPremium: false,
  category: "MUSIC",
  SameVoiceChannel: true,
  InVoiceChannel: true,
  InBotVC: true,
  Player: true,
  ActivePlayer: true,
  botPermissions: [],
  userPermissions: [],
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
    options: [],
  },
  messageRun: async (client, message, args, player, data) => {
    const response = await Resume(client, player, message);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    const response = await Resume(client, player, interaction);
    await interaction.followUp(response);
  },
};

async function Resume(client, player, { member }) {
  if (!player.paused) {
    let thing = new EmbedBuilder().setColor(client.botcolor).setDescription(`The player is not paused.`);
    return { embeds: [thing] };
  }

  await player.resume();

  let thing = new EmbedBuilder().setColor(client.botcolor).setAuthor({
    name: `Resumed the player.`,
    iconURL: member.displayAvatarURL(),
  });
  return { embeds: [thing] };
}
