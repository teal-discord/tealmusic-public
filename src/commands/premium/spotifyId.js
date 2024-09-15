const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const db = require("@models/user");

module.exports = {
  name: "spotifyid",
  description: "share your spotify profile link.",
  cooldown: 6,
  isPremium: false,
  category: "PREMIUM",
  botPermissions: [],
  userPermissions: [],
  SameVoiceChannel: false,
  InVoiceChannel: false,
  InBotVC: false,
  Player: false,
  ActivePlayer: false,
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
    options: [
      {
        name: "profile-link",
        description: "enter profile link",
        required: true,
        type: ApplicationCommandOptionType.String,
      },
    ],
  },

  messageRun: async (client, message, args, player) => {
    const embed = new EmbedBuilder()
      .setColor(client.config.COLORS.RedPink)
      .setAuthor({ name: `This Teal command is only available on slashcommands` })
      .setDescription(`Consider using \`/spotifyid\` instead of legacy command to get better options availability.`);
    return message.safeReply({ embeds: [embed] });
  },
  interactionRun: async (client, interaction, player) => {
    const query = interaction.options.getString("profile-link");
    const response = await spotifyid(client, player, interaction, query);
    await interaction.followUp(response);
  },
};

async function spotifyid(client, player, { member }, query) {
  const parse = require("spotify-uri").parse(query);
  if (!parse.type === "user" || !parse.user) {
    return { content: "Invalid Spotify profile link." };
  }
  const spAcc = await client.spotifyApi.getUser(parse.id);

  let data = await db.findOne({ UserId: member.id });

  if (data) {
    data.spotifyUId = parse.id;
    await data.save();
  } else {
    const data = new db({
      UserId: member.id,
      spotifyUId: parse.id,
    });
    await data.save();
  }

  let thing = new EmbedBuilder()
    .setColor(client.botcolor)
    .setDescription(
      `Your profile [${spAcc.body.display_name}](${spAcc.body.external_urls.spotify}) with (\`${spAcc.body.followers.total}\` Followers) is linked with Teal Music`
    );

  return { embeds: [thing] };
}
