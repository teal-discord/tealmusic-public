const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ChannelType, NewsChannel } = require("discord.js");
//const db = require("@models/247");
module.exports = async (client, oldState, newState) => {
  let guild = newState.guild;
  const newMember = newState.guild.members.cache.get(newState.id);
  const channel = newState.guild.channels.cache.get(newState.channel?.id ?? newState.channelId);

  let player = client.manager.players.get(guild.id);
  if (!player) return;
  if (!newState.guild.members.cache.get(client.user.id).voice.channelId) player.destroy();

  if (newState.id === client.user.id && channel?.type == "GUILD_STAGE_VOICE") {
    if (!oldState.channelId) {
      try {
        await newState.guild.members.me.voice.setSuppressed(false).then(() => console.log(null));
      } catch (err) {
        player.pause(true);
      }
    } else if (oldState.suppress !== newState.suppress) {
      player.pause(newState.suppress);
    }
  }

  if (oldState.id === client.user.id) return;
  const data = await client.twofoursevenModel.findOne({ guild: guild.id });
  if (data) return;

  if (oldState.guild.members.cache.get(client.user.id).voice.channelId !== oldState.channelId) return;
  if (!oldState.channel || oldState.channel.id !== player.voiceChannelId) return;

  let vcMembers2 = oldState.guild.members.me.voice.channel?.members.size;

  if (!vcMembers2 && oldState.channel.members.size === 1) {
    setTimeout(async () => {
      const data = await client.twofoursevenModel.findOne({ guild: guild.id });
      if (data) return;
      const vcW = oldState.guild.members.me.voice.channel.fetch();
      const vcMembers = vcW?.members.filter((member) => !member.user.bot).size;
      if (!vcMembers && vcMembers === 0) {
        if (player) {
          const emd = new EmbedBuilder()
            .setAuthor({
              name: `I have left the voice channel as there is no one listening to music.`,
              iconURL: client.user.displayAvatarURL(),
            })
            .setColor(client.botcolor);
          guild.channels.cache.get(player.textChannelId)?.safeSend({ embeds: [emd] });
          player.destroy(true);
        }
      } else {
        return;
      }
    }, 900 * 1000);
  }
};
