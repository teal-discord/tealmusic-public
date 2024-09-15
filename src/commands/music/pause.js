const { EmbedBuilder } = require("discord.js");
module.exports = {
  name: "pause",
  description: "pause the current playing track.",
  cooldown: 5,
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
    const response = await Pause(client, player, message);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    const response = await Pause(client, player, interaction);
    await interaction.followUp(response);
  },
};

async function Pause(client, player, { member }) {
  if (player.paused) {
    let thing = new EmbedBuilder()
      .setColor(client.botcolor)
      .setDescription(`The player is already paused. resume it with \`/resume\``);
    return { embeds: [thing] };
  }

  await player.pause();

  let thing = new EmbedBuilder().setColor(client.botcolor).setAuthor({
    name: `Paused the player.`,
    iconURL: member.displayAvatarURL(),
  });
  return { embeds: [thing] };
}
