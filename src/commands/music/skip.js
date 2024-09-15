const { EmbedBuilder } = require("discord.js");
module.exports = {
  name: "skip",
  description: "skips the current playing track",
  cooldown: 5,
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
    aliases: ["s", "next", "voteskip", "dusra", "agla"],
    usage: "",
    example: "",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
  },
  messageRun: async (client, message, args, player) => {
    const response = await Skip(client, message, player);
    await message.channel.safeSend(response);
  },
  interactionRun: async (client, interaction, player) => {
    const response = await Skip(client, interaction, player);
    await interaction.followUp(response);
  },
};

async function Skip(client, { member, guild }, player) {
  let usersC = member.voice.channel.members.filter((member) => !member.user.bot).size;
  let required = Math.ceil(usersC / 2);

  if (!player.get("skipvotes")) player.set("skipvotes", []);

  if (player.get("skipvotes").includes(`${member.id}`))
    return {
      embeds: [
        new EmbedBuilder()
          .setColor(client.botcolor)
          .setDescription(`You already voted to skip! (${player.get("skipvotes").length}/${required} people)  votes`),
      ],
    };

  player.get("skipvotes").push(`${member.id}`);
  if (!(player.get("skipvotes").length >= required))
    return {
      content: `<@${member.id}> **Skipping?** (${
        player.get("skipvotes").length
      }/${required} people) \`/forceskip\` or \`@tealmusic fs\` to force`,
      allowedMentions: { users: [member.id] },
    };

  if (player.get("skipvotes").length >= required) {
    player.node.updatePlayer({ guildId: guild.id, playerOptions: { encodedTrack: null } });
    player.set("skipvotes", []);
    let thing = new EmbedBuilder()
      .setDescription(
        `<@${member.id}> ${client.emoji.forward} skipped \`${client.utils.trimTitle(
          player.queue.current.info.title
        )}\` ~ requested by <@${player.queue.current.requester.id}>`
      )
      .setColor(client.botcolor);
    return { embeds: [thing] };
  }
}
