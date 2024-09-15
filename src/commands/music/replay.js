const { EmbedBuilder } = require("discord.js");
module.exports = {
  name: "replay",
  description: "Replay the current song!",
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
    const response = await Replay(client, player, message);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    const response = await Replay(client, player, interaction);
    await interaction.followUp(response);
  },
};

async function Replay(client, player, { member }) {
  player.seek(client.utils.parseTime("0s"));

  let thing = new EmbedBuilder().setColor(client.botcolor).setAuthor({
    name: `Replaying the song.`,
    iconURL: member.displayAvatarURL(),
  });
  return { embeds: [thing] };
}
