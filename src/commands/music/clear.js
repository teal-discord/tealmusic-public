const { EmbedBuilder } = require("discord.js");
module.exports = {
  name: "clear",
  description: "Clears the current queue.",
  cooldown: 10,
  isPremium: false,
  category: "MUSIC",
  botPermissions: [],
  userPermissions: [],
  SameVoiceChannel: true,
  InVoiceChannel: true,
  InBotVC: true,
  Player: true,
  ActivePlayer: true,
  command: {
    enabled: true,
    aliases: ["clearqueue", "empty", "c"],
    usage: "",
    example: "",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
  },
  messageRun: async (client, message, args, player, data) => {
    const response = await Clear(player, client, data.settings, message);
    await message.channel.safeSend(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    const response = await Clear(player, client, data.settings, interaction);
    await interaction.followUp(response);
  },
};

async function Clear(player, client, baseData, { member }) {
  const embed = new EmbedBuilder().setColor(client.botcolor);

  let isdj = false;
  for (let i = 0; i < baseData.djRoles.length; ++i) {
    if (member.roles.cache.has(baseData.djRoles[i])) isdj = true;
  }

  if (!isdj && !member.permissions.has(`Administrator`) && !member.permissions.has(`ManageMessages`)) {
    embed.setDescription("You either need dj a role (or) `Manage Messages` Permissions to forceskip");
    return {
      embeds: [embed],
    };
  }

  player.queue.splice(0, player.queue.tracks.length);
  player.node.updatePlayer({ guildId: player.guildId, playerOptions: { encodedTrack: null } });

  embed.setDescription(`**The queue has been cleared.**`);
  return { embeds: [embed] };
}
