const { EmbedBuilder, Collection } = require("discord.js");
module.exports = {
  name: "cleanup",
  description: "Clear commands and bot messages.",
  cooldown: 120,
  isPremium: false,
  category: "ADMIN",
  botPermissions: ["ManageMessages"],
  userPermissions: ["ManageMessages"],
  command: {
    enabled: true,
    aliases: [],
    usage: "",
    example: "",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [],
  },
  messageRun: async (client, message, args, player, data) => {
    const response = await CleanUp(client, message).catch((e) => {});
    await message.channel.safeSend(response, 5000);
  },
  interactionRun: async (client, interaction, player, data) => {
    const response = await CleanUp(client, interaction);
    await interaction.followUp(response);
  },
};

async function CleanUp(client, { channel }) {
  const messages = await channel.messages.fetch({ limit: 100 });
  const botMessages = messages.filter(
    (msg) => msg.author.id === client.user.id || msg.content.startsWith(`<@${client.user.id}>`)
  );

  let count = 0;
  await botMessages.forEach(async (msg) => {
    await msg.delete().catch((err) => {});
    count++;
  });

  return await { content: `Cleaning up my messages and commands from this channel.` };
}
