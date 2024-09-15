const { EmbedBuilder } = require("discord.js");
module.exports = {
  name: "patreon",
  description: "gives info about our premium plans.",
  cooldown: 5,
  isPremium: false,
  category: "PREMIUM",
  SameVoiceChannel: false,
  InVoiceChannel: false,
  InBotVC: false,
  Player: false,
  ActivePlayer: false,
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
    ephemeral: true,
    options: [],
  },
  messageRun: async (client, message, args, player, data) => {
    const response = await Patreon(client);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    const response = await Patreon(client);
    await interaction.followUp(response);
  },
};

async function Patreon(client) {
  const content =
    `**Users can purchase the respective Plans listed below at [Patreon](${client.config.PATREON})**\n\n` +
    `*Dont forget to connect your discord with patreon to do not get any problems while claiming your perks 😉.* [click here to Connect Discord With Patreon](https://www.patreon.com/settings/apps/discord)\n` +
    `\nAfter buying to patreon join our [support server](${client.config.SUPPORT_SERVER}) to claim your perks`;
  var embed = new EmbedBuilder()
    .setAuthor({
      name: "Teal Music Premium Plans ",
      iconURL: client.user.displayAvatarURL({ size: 4096, dynamic: true }),
    })
    .setDescription(content)
    .setColor(client.botcolor)
    .setImage(
      "https://media.discordapp.net/attachments/1140595072073728100/1140596489907875840/Screenshot_2023-08-14-16-12-35-45_40deb401b9ffe8e1df2f1cc5ba480b12.jpg"
    );
  return { embeds: [embed] };
}
