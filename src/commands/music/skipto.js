const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
module.exports = {
  name: "skipto",
  description: "skip to a specific track in queue.",
  cooldown: 5,
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
    aliases: ["jump"],
    usage: "<track no. in queue>",
    minArgsCount: 1,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "tracks",
        description: "enter track no. in queue",
        required: true,
        type: ApplicationCommandOptionType.Number,
      },
    ],
  },
  messageRun: async (client, message, args, player, data) => {
    const response = await Skipto(client, player, message, args[0], data.settings);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    const input = interaction.options.getNumber("tracks");
    const response = await Skipto(client, player, interaction, input, data.settings);
    await interaction.followUp(response);
  },
};

async function Skipto(client, player, { member }, input, baseData) {
  const position = Number(input);

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
    thing.setDescription("You either need dj a role (or) `Manage Messages` Permissions to skipto");
    return {
      embeds: [thing],
    };
  }

  if (!position) {
    return { embeds: [thing.setDescription(`Please provide a queue number to skip to`)] };
  }

  if (position <= 0) {
    return { embeds: [thing.setDescription(`The queue doesn't have negative or 0 tracks`)] };
  }

  if (position > player.queue.tracks.length) {
    return { embeds: [thing.setDescription(`The queue doesn't have that many tracks`)] };
  }

  if (position == 1) player.skip();

  await player.skip(position);
  await player.node.updatePlayer({ guildId: player.guildId, playerOptions: { encodedTrack: null } });
  player.set("skipvotes", []);
  return {
    embeds: [new EmbedBuilder().setColor(client.botcolor).setDescription(`Skipped to the track no. ${position}`)],
  };
}
