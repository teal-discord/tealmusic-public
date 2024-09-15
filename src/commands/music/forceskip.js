const { EmbedBuilder } = require("discord.js");
module.exports = {
  name: "forceskip",
  description: "forcefully skips the current playing track",
  cooldown: 4,
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
    aliases: ["fs"],
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
    const response = await ForceSkip(client, message, player, data.settings);
    await message.channel.safeSend(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    const response = await ForceSkip(client, interaction, player, data.settings);
    await interaction.followUp(response);
  },
};

async function ForceSkip(client, { member, guild }, player, baseData) {
  let thing = new EmbedBuilder().setColor(client.botcolor);

  let isdj = false;
  for (let i = 0; i < baseData.djRoles.length; i++) {
    if (member.roles.cache.has(baseData.djRoles[i])) isdj = true;
  }

  if (
    !isdj &&
    !member.permissions.has(`Administrator`) &&
    !member.permissions.has(`ManageMessages`) &&
    player.queue.current.requester.id !== member.id
  ) {
    thing.setDescription("You either need dj a role (or) `Manage Messages` Permissions to forceskip");
    return {
      embeds: [thing],
    };
  }
  thing.setDescription(
    `${client.emoji.forward} skipped [\`${player.queue.current.info.title}\`] ~ requested by <@${player.queue.current.requester.id}>`
  );
  await player.node.updatePlayer({ guildId: guild.id, playerOptions: { encodedTrack: null } });
  player.set("skipvotes", []);

  return { embeds: [thing] };
}
