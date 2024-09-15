const { commandHandler } = require("../../../handlers/index");
const db = require("@models/playlists");
module.exports = async (client, interaction) => {
  if (!interaction.guild) {
    return await interaction
      .reply({
        content: "My Commands are only executed in a discord server",
        ephemeral: true,
      })
      .catch((e) => {});
  }
  if (interaction.isChatInputCommand()) {
    await commandHandler.handleSlashCommand(client, interaction);
  }
  if (interaction.isAutocomplete()) {
    if (interaction.commandName === "play") {
      const focusedValue = interaction.options.getString("query");
      if (focusedValue) {
        const res = await client.searchTrack(focusedValue, {
          requester: interaction.user,
        });
        let songs = [];
        switch (res.loadType) {
          case "track":
            if (res.tracks[0]) {
              songs.push({
                name: `"${client.utils
                  .trimTitle(res.tracks[0].info.title)
                  .substring(0, 60)}" by ${res.tracks[0].info.author.substring(0, 30)}`,
                value: res.tracks[0].info.uri,
              });
            }
            break;
          case "playlist":
            songs.push({ name: `${res.playlist.title}`, value: res.playlist.uri });
            break;
          case "search":
            res.tracks.forEach((track) => {
              songs.push({
                name: `"${client.utils.trimTitle(track.info.title).substring(0, 60)}" by ${track.info.author.substring(
                  0,
                  30
                )}`,
                value: track.info.uri,
              });
            });
            break;
        }
        interaction.respond(songs).catch(() => {});
      } else {
        interaction
          .respond([
            {
              name: "Type to search something",
              value: `Type to search something`,
            },
          ])
          .catch(() => {});
      }
    }
    if (interaction.commandName === "playlist") {
      let data = await db.find({ UserId: interaction.user.id });
      let playlist = [];
      if (data.length) {
        data.forEach((x) => {
          playlist.push({
            name: `${x.PlaylistName} | ${x.Playlist.length} tracks`,
            value: `${x.PlaylistName}`,
          });
        });
      } else {
        interaction
          .respond([
            {
              name: "No playlists found",
              value: `no playlists found`,
            },
          ])
          .catch(() => {});
      }
      interaction.respond(playlist).catch(() => {});
    }
  }
};
