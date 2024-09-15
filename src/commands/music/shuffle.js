const { EmbedBuilder } = require("discord.js");
module.exports = {
  name: "shuffle",
  description: "Shuffle the queue.",
  cooldown: 30,
  isPremium: true,
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
    const response = await Shuffle(client, player, message);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    const response = await Shuffle(client, player, interaction);
    await interaction.followUp(response);
  },
};

async function Shuffle(client, player, { member }) {
  if (!player.queue.tracks[0]) {
    let thing = new EmbedBuilder().setColor(client.botcolor).setDescription(`There's nothing in the queue to shuffle`);
    return { embeds: [thing] };
  }

  await player.queue.shuffle();

  let thing = new EmbedBuilder().setColor(client.botcolor).setAuthor({
    name: `Shuffled the queue`,
    iconURL: member.displayAvatarURL(),
  });
  return { embeds: [thing] };
}
