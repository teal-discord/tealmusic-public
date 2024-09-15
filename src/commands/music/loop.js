const { EmbedBuilder } = require("discord.js");
module.exports = {
  name: "loop",
  description: "loops the queue or current playing song",
  cooldown: 3,
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
    aliases: ["repeat"],
    usage: "",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "mode",
        description: "Select a loop mode",
        type: 3,
        required: false,
        choices: [
          { name: "Track", value: "track" },
          { name: "Queue", value: "queue" },
          { name: "Disable", value: "none" },
        ],
      },
    ],
  },
  messageRun: async (client, message, args, player, data) => {
    const response = await Loop(client, player, args[0]);
    message.safeReply(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    let mode = interaction.options.getString("mode");
    let response;
    if (mode) response = await Loop(client, player, mode.toLowerCase());
    else response = await Loop(client, player);
    interaction.followUp(response);
  },
};

async function Loop(client, player, args) {
  if (!args) {
    if (player.repeatMode === "track") {
      await player.setRepeatMode("off");
      let thing = new EmbedBuilder().setColor(client.botcolor).setDescription(`**Looping disabled.**`);
      return { embeds: [thing] };
    } else if (player.repeatMode === "off") {
      await player.setRepeatMode("queue");
      let thing = new EmbedBuilder().setColor(client.botcolor).setDescription(`**Looping the queue activated.**`);
      return { embeds: [thing] };
    } else if (player.repeatMode === "queue") {
      await player.setRepeatMode("track");
      let thing = new EmbedBuilder().setColor(client.botcolor).setDescription(`**Now looping the current track.**`);
      return { embeds: [thing] };
    }
  }

  if (["off", "c", "clear", "disable", "none"].includes(args)) {
    await player.setRepeatMode("off");
    let thing = new EmbedBuilder().setColor(client.botcolor).setDescription(`**Looping disabled.**`);
    return { embeds: [thing] };
  } else if (["q", "queue"].includes(args)) {
    await player.setRepeatMode("queue");
    let thing = new EmbedBuilder().setColor(client.botcolor).setDescription(`**Looping the queue activated.**`);
    return { embeds: [thing] };
  } else if (
    args.toLowerCase() === `song` ||
    args.toLowerCase() === `track` ||
    args.toLowerCase() === `s` ||
    args.toLowerCase() === `t`
  ) {
    await player.setRepeatMode("track");
    let thing = new EmbedBuilder().setColor(client.botcolor).setDescription(`**Now looping the current track.**`);
    return { embeds: [thing] };
  }
}
