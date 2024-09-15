const { EmbedBuilder } = require("discord.js");
const GuildModel = require("@models/settings");
module.exports = {
  name: "djmode",
  description: "get info about dj mode in your server.",
  cooldown: 30,
  isPremium: false,
  category: "INFO",
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
    const response = await Djmode(client, message);
    await message.safeReply(response);
  },
  interactionRun: async (client, interaction, player, data) => {
    const response = await Djmode(client, interaction);
    await interaction.followUp(response);
  },
};

async function Djmode(client, { guild }) {
  let guildData = await GuildModel.findOne({ guild: guild.id });

  const emd = new EmbedBuilder().setColor(client.botcolor).addFields(
    {
      name: `DJ Commands`,
      value: `\`\`\`${guildData.djCmd.join(", ")}\`\`\``,
      inline: false,
    },
    {
      name: "DJ Roles",
      value: `${
        guildData.djRoles.length > 0
          ? guildData.djRoles.map((djId) => `<@&${djId}>`).join(", ")
          : `\`\`\`No DJ roles set\`\`\``
      }`,
      inline: false,
    }
  );

  return { embeds: [emd] };
}
