const { EmbedBuilder } = require("discord.js");
module.exports = {
  name: "stop",
  description: "Stops the player and clear the queue",
  cooldown: 6,
  isPremium: false,
  category: "MUSIC",
  SameVoiceChannel: true,
  InVoiceChannel: true,
  InBotVC: true,
  Player: true,
  ActivePlayer: false,
  botPermissions: [],
  userPermissions: [],
  command: {
    enabled: true,
    aliases: ["leave", "dc", "fuckoff", "fucku", "disconnect "],
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
    const response = await Stop(client, player, message);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    const response = await Stop(client, player, interaction);
    await interaction.followUp(response);
  },
};

async function Stop(client, player, { member }) {
  await player.destroy(true);

  let thing = new EmbedBuilder().setDescription(`${client.emoji.stop} Destroyed the player!`).setColor(client.botcolor);
  return { embeds: [thing] };
}
