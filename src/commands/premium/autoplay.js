const { EmbedBuilder } = require("discord.js");
module.exports = {
  name: "autoplay",
  description: "Toggle the bot to continuously queue up recommended tracks.",
  cooldown: 6,
  isPremium: true,
  category: "PREMIUM",
  botPermissions: [],
  userPermissions: ["ManageMessages"],
  SameVoiceChannel: true,
  InVoiceChannel: true,
  InBotVC: true,
  Player: true,
  ActivePlayer: true,
  command: {
    enabled: true,
    aliases: ["ap", "auto"],
    usage: "",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
  },

  messageRun: async (client, message, args, player) => {
    const response = await Autoplay(client, player, message);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player) => {
    const response = await Autoplay(client, player, interaction);
    await interaction.followUp(response);
  },
};

async function Autoplay(client, player, { member }) {
  player.set("autoplay", !player.get("autoplay"));
  player.set("requester", member.user);

  let thing = new EmbedBuilder()
    .setColor(client.botcolor)
    .setDescription(`${client.emoji.playlist} autoplay is now ${player.get("autoplay") ? "enabled" : "disabled"}.`);

  return { embeds: [thing] };
}
