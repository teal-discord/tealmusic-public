const { ActivityType } = require("discord.js");
const ascii = require("ascii-table");
//const db = require("@models/247");
const fetch = require("node-fetch");
const UsersDB = require("@models/premium-users");

module.exports = async (client) => {
  await client.manager.init({ ...client.user, shards: client.shard.shardCount });
  //
  setTimeout(() => {
    client.user.setPresence({ status: client.config.PRESENCE.STATUS });
    client.user.setActivity({
      name: client.config.PRESENCE.TEXT,
      type: ActivityType[client.config.PRESENCE.TYPE],
    });
  }, 5000);

  setInterval(() => {
    client.user.setPresence({ status: client.config.PRESENCE.STATUS });
    client.user.setActivity({
      name: client.config.PRESENCE.TEXT,
      type: ActivityType[client.config.PRESENCE.TYPE],
    });
  }, 360000);
  //
  setInterval(() => {
    updateTopGGStats(client);
  }, 1000 * 60 * 60 * 1);

  //
  const ReadyTable = new ascii(`cluster #${client.shard.clusterId} Is READY`);
  const Guilds = client.guilds.cache.size;
  const Users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
  const Channels = client.channels.cache.size;
  const ram = (await (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0)) + "mb";
  const rssRam = (await (process.memoryUsage().rss / 1024 / 1024).toFixed(0)) + "mb";

  ReadyTable.setHeading("Guilds", "Users", "Channels", "Ram", "RssRam");
  ReadyTable.addRow(`${Guilds} Servers`, `${Users} Users`, `${Channels} Channels`, `${ram}`, `${rssRam}`);
  console.log(ReadyTable.toString().brightCyan);
  //

  //
  await client.registerInteractions();
  //

  //
  client.logger.debug("Auto Reconnect Collecting player 24/7 data");
  const maindata = await client.twofoursevenModel.find();
  client.logger.debug(
    `Auto Reconnect found data is ${
      maindata.length
        ? `${maindata.length} players log ${maindata.length > 1 ? "s" : ""}. Resuming all auto reconnect queue [est. ${
            maindata.length
          } seconds to complete]`
        : "0 queue"
    }`
  );

  // auto connect
  setTimeout(() => {
    for (let data of maindata) {
      const index = maindata.indexOf(data);
      setTimeout(async () => {
        const channel = client.channels.cache.get(data.autojoinTC);
        const voice = client.channels.cache.get(data.autojoinVC);
        if (!channel || !voice) return;
        let p = await client.manager.createPlayer({
          guildId: data.guild,
          voiceChannelId: data.autojoinVC,
          textChannelId: data.autojoinTC,
          selfDeaf: true,
        });
        p.connect();
      }, index * 500); //joining one player at .five secound
    }
  }, 5000);
  // auto reconnect
  setInterval(async () => {
    const maindataW = await client.twofoursevenModel.find();
    for (let data of maindataW) {
      const player = client.manager.players.get(data.guild);
      if (player) return;
      const channel = client.channels.cache.get(data.autojoinTC);
      const voice = client.channels.cache.get(data.autojoinVC);
      if (!channel || !voice) return;
      let p = await client.manager.createPlayer({
        guildId: data.guild,
        voiceChannelId: data.autojoinVC,
        textChannelId: data.autojoinTC,
        selfDeaf: true,
      });
      p.connect();
    }
  }, 60000);

  //loading premium Users
  try {
    let doc = await UsersDB.findOne();

    client.premiumUsers = doc.Ids;
  } catch (error) {}
};

async function updateTopGGStats(client) {
  if (client.shard.clusterId === 0 && client.application.id === "972795104525975622") {
    const guildAmount = await client.shard
      .broadcastEval((c) => c.guilds.cache.size)
      .then((x) => x.reduce((p, n) => p + n, 0));
    await fetch(`https://top.gg/api/bots/972795104525975622/stats`, {
      method: "POST",
      headers: { Authorization: process.env.TOPGG_AUTHKEY },
      body: new URLSearchParams({
        server_count: `${guildAmount}`,
        shard_count: `${client.shard.shardCount}`,
      }),
    }).then(() => client.logger.log(`TOP-GG-UPDATER - posted the Stats`));
  } else {
    return;
  }
}
